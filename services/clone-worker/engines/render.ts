import type { Page } from "playwright";
import { waitForRenderablePage } from "../lib/page-setup.js";
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

/**
 * SPA 렌더 — navigation 중 에셋 body() 캡처는 RAM 부족(OOM)을 유발하므로
 * 렌더된 HTML만 저장하고 에셋 URL은 원본 절대경로를 유지합니다.
 */
export async function renderSinglePage(
  page: Page,
  url: string,
  _options?: CloneOptions,
): Promise<CloneResult> {
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
    assetBuffers: new Map(),
    pagesCrawled: 1,
    runId: makeRunId(url),
  });
}
