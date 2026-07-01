import type { Page, Response } from "playwright";
import { waitForRenderablePage } from "../lib/page-setup.js";
import { savePageOutput, makeRunId } from "../lib/output.js";
import type { CloneOptions, CloneResult } from "../types.js";

const TITLE_RE = /<title[^>]*>([\s\S]*?)<\/title>/i;
const DESC_RE = /<meta[^>]+name=["']description["'][^>]+content=["']([\s\S]*?)["']/i;
const OG_RE = /<meta[^>]+property=["']og:image["'][^>]+content=["']([\s\S]*?)["']/i;

const MAX_CAPTURED_ASSETS = 40;
const MAX_ASSET_BYTES = 4 * 1024 * 1024;
const MAX_CAPTURE_IN_FLIGHT = 5;

function parseMeta(html: string) {
  return {
    title: html.match(TITLE_RE)?.[1]?.trim() ?? "Untitled",
    description: html.match(DESC_RE)?.[1]?.trim() ?? null,
    ogImage: html.match(OG_RE)?.[1]?.trim() ?? null,
  };
}

function shouldCaptureAsset(ct: string, assetUrl: string): boolean {
  if (ct.includes("text/css") || ct.includes("javascript")) return true;
  if (ct.includes("image/")) return true;
  if (assetUrl.endsWith(".js") || assetUrl.endsWith(".css")) return true;
  return false;
}

export async function renderSinglePage(
  page: Page,
  url: string,
  options?: CloneOptions,
): Promise<CloneResult> {
  const assetBuffers = new Map<string, Buffer>();
  let captureInFlight = 0;

  const onResponse = (res: Response) => {
    if (assetBuffers.size >= MAX_CAPTURED_ASSETS) return;
    if (captureInFlight >= MAX_CAPTURE_IN_FLIGHT) return;

    void (async () => {
      try {
        const assetUrl = res.url();
        const ct = res.headers()["content-type"] ?? "";
        if (!res.ok()) return;
        if (!shouldCaptureAsset(ct, assetUrl)) return;

        const len = Number(res.headers()["content-length"] ?? 0);
        if (len > MAX_ASSET_BYTES) return;

        captureInFlight += 1;
        const body = await res.body();
        if (body.length > 0 && body.length <= MAX_ASSET_BYTES) {
          assetBuffers.set(assetUrl, Buffer.from(body));
        }
      } catch {
        /* skip */
      } finally {
        captureInFlight = Math.max(0, captureInFlight - 1);
      }
    })();
  };

  page.on("response", onResponse);

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90_000 });
    await waitForRenderablePage(page);

    const html = await page.content();
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
