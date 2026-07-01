import type { Browser, BrowserContext, Page } from "playwright";
import {
  acquireJobBrowser,
  acquireSharedBrowser,
  isBrowserClosedError,
  releaseBrowser,
  resetSharedBrowser,
  usePerJobBrowser,
} from "./browser-lifecycle.js";
import { appendLog, getJob, updateJob } from "./jobs.js";
import { renderSinglePage } from "../engines/render.js";
import { crawlSite } from "../engines/site-crawler.js";
import { exploreSpaStates } from "../engines/spa-explorer.js";
import type { WorkerJob } from "../types.js";

let activePages = 0;
const MAX_POOL = Number(process.env.WORKER_BROWSER_POOL ?? 1);

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36";

async function openPage(): Promise<{
  page: Page;
  context: BrowserContext;
  perJob: boolean;
  browser: Browser;
}> {
  const perJob = usePerJobBrowser();
  const browser = perJob ? await acquireJobBrowser() : await acquireSharedBrowser();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: USER_AGENT,
    deviceScaleFactor: 1,
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();
  return { page, context, perJob, browser };
}

async function runWithBrowserRetry<T>(
  job: WorkerJob,
  fn: (page: Page) => Promise<T>,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    let page: Page | null = null;
    let context: BrowserContext | null = null;
    let perJob = false;
    let browser: Browser | null = null;

    try {
      while (activePages >= MAX_POOL) {
        await new Promise((r) => setTimeout(r, 500));
      }
      activePages += 1;

      ({ page, context, perJob, browser } = await openPage());

      if (attempt > 1) {
        appendLog(job, `브라우저 재시작 후 재시도 (${attempt}/2)`, "warn");
      }

      return await fn(page);
    } catch (error) {
      lastError = error;
      if (attempt < 2 && isBrowserClosedError(error)) {
        appendLog(job, "브라우저 연결 끊김 — 재시작합니다", "warn");
        if (perJob && browser) {
          await releaseBrowser(browser, true);
        } else {
          await resetSharedBrowser();
        }
        continue;
      }
      throw error;
    } finally {
      if (context) await context.close().catch(() => {});
      if (browser) await releaseBrowser(browser, perJob);
      activePages = Math.max(0, activePages - 1);
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Worker browser failed");
}

export async function processJob(jobId: string): Promise<void> {
  const job = getJob(jobId);
  if (!job) return;

  updateJob(jobId, { status: "running", progress: 10 });
  appendLog(job, `처리 시작 mode=${job.request.mode}`);

  try {
    const result = await runWithBrowserRetry(job, async (page) => {
      updateJob(jobId, { progress: 25 });
      const { mode, url, options } = job.request;

      if (mode === "render") {
        appendLog(job, "Playwright render");
        return renderSinglePage(page, url, options);
      }
      if (mode === "full" || mode === "mirror") {
        appendLog(job, `BFS crawl mode=${mode}`);
        return crawlSite(page, url, mode, options ?? {});
      }
      if (mode === "spa-states") {
        appendLog(job, "SPA state exploration");
        return exploreSpaStates(page, url, options ?? {});
      }
      throw new Error(`Unsupported worker mode: ${mode}`);
    });

    updateJob(jobId, { status: "success", progress: 100, result });
    appendLog(job, `완료 pages=${result.pagesCrawled ?? 1}`);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Worker error";
    appendLog(job, msg, "error");
    updateJob(jobId, { status: "failed", progress: 100, error: msg });
  }
}

export function browserPoolStats() {
  return {
    active: activePages,
    max: MAX_POOL,
    perJobBrowser: usePerJobBrowser(),
  };
}

export { shutdownAllBrowsers as shutdownBrowser } from "./browser-lifecycle.js";
