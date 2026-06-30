import { chromium, type Browser } from "playwright";
import { appendLog, getJob, updateJob } from "./jobs.js";
import { renderSinglePage } from "../engines/render.js";
import { crawlSite } from "../engines/site-crawler.js";
import { exploreSpaStates } from "../engines/spa-explorer.js";
import type { WorkerJob } from "../types.js";

let browser: Browser | null = null;
let activePages = 0;
const MAX_POOL = Number(process.env.WORKER_BROWSER_POOL ?? 2);

async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await chromium.launch({
      headless: process.env.WORKER_HEADLESS !== "false",
    });
  }
  return browser;
}

export async function processJob(jobId: string): Promise<void> {
  const job = getJob(jobId);
  if (!job) return;

  updateJob(jobId, { status: "running", progress: 10 });
  appendLog(job, `처리 시작 mode=${job.request.mode}`);

  let page = null;
  try {
    while (activePages >= MAX_POOL) {
      await new Promise((r) => setTimeout(r, 500));
    }
    activePages += 1;

    const b = await getBrowser();
    page = await b.newPage();
    updateJob(jobId, { progress: 25 });

    let result;
    const { mode, url, options } = job.request;

    if (mode === "render") {
      appendLog(job, "Playwright render");
      result = await renderSinglePage(page, url, options);
    } else if (mode === "full" || mode === "mirror") {
      appendLog(job, `BFS crawl mode=${mode}`);
      result = await crawlSite(page, url, mode, options ?? {});
    } else if (mode === "spa-states") {
      appendLog(job, "SPA state exploration");
      result = await exploreSpaStates(page, url, options ?? {});
    } else {
      throw new Error(`Unsupported worker mode: ${mode}`);
    }

    updateJob(jobId, { status: "success", progress: 100, result });
    appendLog(job, `완료 pages=${result.pagesCrawled ?? 1}`);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Worker error";
    appendLog(job, msg, "error");
    updateJob(jobId, { status: "failed", progress: 100, error: msg });
  } finally {
    if (page) await page.close().catch(() => {});
    activePages = Math.max(0, activePages - 1);
  }
}

export function browserPoolStats() {
  return { active: activePages, max: MAX_POOL };
}

export async function shutdownBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
  }
}
