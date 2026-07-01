import type { Page } from "playwright";

const BLOCKED_URL =
  /google-analytics|googletagmanager|facebook\.net|hotjar|clarity\.ms|doubleclick\.net/i;

/** Render Starter RAM 절약 — 미디어·트래킹 차단 */
export async function setupClonePage(page: Page): Promise<void> {
  page.setDefaultNavigationTimeout(90_000);
  page.setDefaultTimeout(60_000);

  await page.route("**/*", (route) => {
    const req = route.request();
    const type = req.resourceType();
    if (["media", "websocket", "eventsource"].includes(type)) {
      return route.abort();
    }
    if (BLOCKED_URL.test(req.url())) {
      return route.abort();
    }
    return route.continue();
  });
}

/** SPA(Next.js 등) — networkidle 대신 본문 렌더 대기 */
export async function waitForRenderablePage(page: Page): Promise<void> {
  await page.waitForLoadState("load", { timeout: 25_000 }).catch(() => {});
  await page
    .waitForFunction(
      () => {
        const text = document.body?.innerText?.replace(/\s+/g, " ").trim() ?? "";
        if (text.length > 20) return true;
        return Boolean(
          document.querySelector("main, #__next, #root, [data-reactroot], h1"),
        );
      },
      { timeout: 20_000 },
    )
    .catch(() => {});
  await page.waitForTimeout(1_500);
}
