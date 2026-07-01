import type { Page } from "playwright";

const BLOCKED_URL =
  /google-analytics|googletagmanager|facebook\.net|hotjar|clarity\.ms|doubleclick\.net/i;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Render Starter RAM 절약 — 미디어·트래킹 차단 */
export async function setupClonePage(page: Page): Promise<void> {
  page.setDefaultNavigationTimeout(90_000);
  page.setDefaultTimeout(45_000);

  await page.route("**/*", (route) => {
    const req = route.request();
    const type = req.resourceType();
    if (type === "media" || type === "websocket") {
      return route.abort();
    }
    if (BLOCKED_URL.test(req.url())) {
      return route.abort();
    }
    return route.continue();
  });
}

/** SPA — page.waitForTimeout 대신 Node delay 사용 (탭 크래시 시 안전) */
export async function waitForRenderablePage(page: Page): Promise<void> {
  await page.waitForLoadState("load", { timeout: 20_000 }).catch(() => {});
  await page
    .waitForFunction(() => (document.body?.innerText?.trim().length ?? 0) > 15, {
      timeout: 12_000,
    })
    .catch(() => {});
  await delay(800);
}
