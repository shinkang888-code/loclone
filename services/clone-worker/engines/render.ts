import type { Page, Response } from "playwright";
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

  const onResponse = async (res: Response) => {
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
  };

  page.on("response", onResponse);

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.waitForLoadState("networkidle", { timeout: 30_000 }).catch(() => {});

    let html = await page.content();
    const finalUrl = page.url();
    const meta = parseMeta(html);

    return savePageOutput({
      sourceUrl: url,
      finalUrl,
      html,
      title: meta.title,
      description: meta.description,
      ogImage: meta.ogImage,
      assetBuffers,
      pagesCrawled: 1,
      runId: makeRunId(url),
    });
  } finally {
    page.off("response", onResponse);
  }
}
