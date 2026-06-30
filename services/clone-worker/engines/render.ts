import type { Page } from "playwright";
import { rewriteHtmlLinks } from "../lib/link-rewriter.js";
import { savePageOutput, makeRunId } from "../lib/output.js";
import type { CloneOptions, CloneResult } from "../types.js";

const TITLE_RE = /<title[^>]*>([\s\S]*?)<\/title>/i;
const DESC_RE = /<meta[^>]+name=["']description["'][^>]+content=["']([\s\S]*?)["']/i;
const OG_RE = /<meta[^>]+property=["']og:image["'][^>]+content=["']([\s\S]*?)["']/i;

function parseMeta(html: string) {
  return {
    title: html.match(TITLE_RE)?.[1]?.trim() ?? "Untitled",
    description: html.match(DESC_RE)?.[1]?.trim() ?? null,
    ogImage: html.match(OG_RE)?.[1]?.trim() ?? null,
  };
}

export async function renderSinglePage(
  page: Page,
  url: string,
  options?: CloneOptions,
): Promise<CloneResult> {
  const assetBuffers = new Map<string, Buffer>();
  page.on("response", async (res) => {
    try {
      const assetUrl = res.url();
      const ct = res.headers()["content-type"] ?? "";
      if (!res.ok()) return;
      if (
        !ct.includes("text/css") &&
        !ct.includes("javascript") &&
        !ct.includes("image/") &&
        !ct.includes("font/") &&
        !ct.includes("video/") &&
        !assetUrl.endsWith(".js") &&
        !assetUrl.endsWith(".css")
      ) {
        return;
      }
      const body = await res.body();
      if (body.length > 0 && body.length < 12 * 1024 * 1024) {
        assetBuffers.set(assetUrl, Buffer.from(body));
      }
    } catch {
      /* skip */
    }
  });

  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForLoadState("networkidle", { timeout: 30_000 }).catch(() => {});

  let html = await page.content();
  const finalUrl = page.url();
  const meta = parseMeta(html);

  const assetMap = new Map<string, string>();
  const runId = makeRunId(url);
  let i = 0;
  for (const assetUrl of assetBuffers.keys()) {
    i += 1;
    assetMap.set(assetUrl, `/clones/${runId}/assets/${String(i).padStart(3, "0")}-asset`);
  }
  html = rewriteHtmlLinks(html, finalUrl, assetMap);

  return savePageOutput({
    sourceUrl: url,
    finalUrl,
    html,
    title: meta.title,
    description: meta.description,
    ogImage: meta.ogImage,
    assetBuffers,
    pagesCrawled: 1,
    runId,
  });
}
