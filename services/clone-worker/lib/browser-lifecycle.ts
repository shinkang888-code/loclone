import { chromium, type Browser } from "playwright";

const LAUNCH_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
  "--disable-gpu",
  "--disable-software-rasterizer",
  "--disable-extensions",
  "--no-first-run",
  "--no-zygote",
];

let browser: Browser | null = null;
let launching: Promise<Browser> | null = null;

export function isBrowserClosedError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    msg.includes("Target page, context or browser has been closed") ||
    msg.includes("Browser has been closed") ||
    msg.includes("Connection closed")
  );
}

async function launchBrowser(): Promise<Browser> {
  const instance = await chromium.launch({
    headless: process.env.WORKER_HEADLESS !== "false",
    args: LAUNCH_ARGS,
    timeout: 60_000,
  });

  instance.on("disconnected", () => {
    if (browser === instance) {
      browser = null;
    }
  });

  return instance;
}

export async function acquireSharedBrowser(): Promise<Browser> {
  if (browser?.isConnected()) {
    return browser;
  }

  if (browser) {
    await browser.close().catch(() => {});
    browser = null;
  }

  if (!launching) {
    launching = launchBrowser()
      .then((b) => {
        browser = b;
        return b;
      })
      .finally(() => {
        launching = null;
      });
  }

  return launching;
}

export async function acquireJobBrowser(): Promise<Browser> {
  return launchBrowser();
}

export function usePerJobBrowser(): boolean {
  return (
    process.env.WORKER_BROWSER_PER_JOB === "1" ||
    process.env.WORKER_BROWSER_PER_JOB === "true" ||
    Boolean(process.env.RENDER)
  );
}

export async function releaseBrowser(instance: Browser, perJob: boolean): Promise<void> {
  if (perJob) {
    await instance.close().catch(() => {});
  }
}

export async function resetSharedBrowser(): Promise<void> {
  if (browser) {
    await browser.close().catch(() => {});
    browser = null;
  }
}

export async function shutdownAllBrowsers(): Promise<void> {
  await resetSharedBrowser();
}

export function sharedBrowserConnected(): boolean {
  return Boolean(browser?.isConnected());
}
