import type { Page } from "playwright";
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

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await delay(4_000);
  await page
    .waitForFunction(() => (document.body?.innerText?.trim().length ?? 0) > 10, {
      timeout: 20_000,
    })
    .catch(() => {});

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
