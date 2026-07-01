import type { Page } from "playwright";
import { setupClonePage, delay } from "../lib/page-setup.js";
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

async function readPageHtml(page: Page): Promise<string> {
  try {
    return await page.content();
  } catch {
    return page.evaluate(() => document.documentElement.outerHTML);
  }
}

export async function renderSinglePage(
  page: Page,
  url: string,
  _options?: CloneOptions,
): Promise<CloneResult> {
  page.setDefaultNavigationTimeout(180_000);
  await setupClonePage(page);
  await page.goto(url, { waitUntil: "commit", timeout: 180_000 });
  await delay(12_000);

  const html = await readPageHtml(page);
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
