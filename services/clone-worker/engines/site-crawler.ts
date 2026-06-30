import type { Page } from "playwright";
import { discoverSitemapUrls, filterSameOrigin } from "../lib/sitemap-seed.js";
import { savePageOutput, makeRunId } from "../lib/output.js";
import { rewriteHtmlLinks } from "../lib/link-rewriter.js";
import { renderSinglePage } from "./render.js";
import type { CloneOptions, CloneResult } from "../types.js";

function sameOrigin(a: string, b: string): boolean {
  try {
    return new URL(a).origin === new URL(b).origin;
  } catch {
    return false;
  }
}

function extractLinks(html: string, baseUrl: string): string[] {
  const hrefRe = /href=["']([^"'#]+)["']/gi;
  const out = new Set<string>();
  let m = hrefRe.exec(html);
  while (m) {
    try {
      const abs = new URL(m[1], baseUrl).toString();
      if (abs.startsWith("http")) out.add(abs.split("#")[0]!);
    } catch {
      /* skip */
    }
    m = hrefRe.exec(html);
  }
  return [...out];
}

export async function crawlSite(
  page: Page,
  startUrl: string,
  mode: "full" | "mirror" | "spa-states",
  options: CloneOptions,
): Promise<CloneResult> {
  const maxDepth = options.maxDepth ?? (mode === "mirror" ? 5 : 2);
  const maxPages = options.maxPages ?? (mode === "mirror" ? 50 : 30);
  const sameOnly = options.sameOriginOnly !== false;

  const queue: Array<{ url: string; depth: number }> = [{ url: startUrl, depth: 0 }];
  const visited = new Set<string>();
  const allAssets = new Map<string, Buffer>();
  let primaryHtml = "";
  let finalUrl = startUrl;
  let title = "Untitled";
  let description: string | null = null;
  let ogImage: string | null = null;
  const runId = makeRunId(startUrl);

  if (options.seedSitemaps) {
    const seeds = await discoverSitemapUrls(startUrl);
    const filtered = sameOnly ? filterSameOrigin(seeds, startUrl) : seeds;
    for (const u of filtered.slice(0, maxPages)) {
      if (!visited.has(u)) queue.push({ url: u, depth: 1 });
    }
  }

  let pagesCrawled = 0;

  while (queue.length > 0 && pagesCrawled < maxPages) {
    const item = queue.shift()!;
    if (visited.has(item.url)) continue;
    if (item.depth > maxDepth) continue;
    visited.add(item.url);

    const pageResult = await renderSinglePage(page, item.url, options);
    pagesCrawled += 1;

    if (pagesCrawled === 1) {
      primaryHtml = await page.content();
      finalUrl = page.url();
      title = pageResult.title;
      description = pageResult.description;
      ogImage = pageResult.ogImage;
    }

    for (const asset of pageResult.downloadedAssets) {
      try {
        const res = await fetch(asset.sourceUrl);
        if (res.ok) {
          allAssets.set(asset.sourceUrl, Buffer.from(await res.arrayBuffer()));
        }
      } catch {
        /* skip */
      }
    }

    if (mode === "spa-states" && pagesCrawled >= Math.min(5, maxPages)) {
      break;
    }

    const links = extractLinks(await page.content(), item.url);
    for (const link of links) {
      if (visited.has(link)) continue;
      if (sameOnly && !sameOrigin(link, startUrl)) continue;
      queue.push({ url: link, depth: item.depth + 1 });
    }
  }

  const assetMap = new Map<string, string>();
  let idx = 0;
  for (const u of allAssets.keys()) {
    idx += 1;
    assetMap.set(u, `/clones/${runId}/assets/${String(idx).padStart(3, "0")}`);
  }

  primaryHtml = rewriteHtmlLinks(primaryHtml || "<html></html>", finalUrl, assetMap);

  return savePageOutput({
    sourceUrl: startUrl,
    finalUrl,
    html: primaryHtml,
    title,
    description,
    ogImage,
    assetBuffers: allAssets,
    pagesCrawled,
    runId,
  });
}
