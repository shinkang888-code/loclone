import type { Page } from "playwright";

const BLOCKED_URL =
  /google-analytics|googletagmanager|facebook\.net|hotjar|clarity\.ms|doubleclick\.net/i;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Render 512MB~ RAM 환경 — 이미지·폰트·미디어 차단으로 Chromium OOM 방지.
 * CSS/JS는 유지해 SPA 텍스트·레이아웃 렌더.
 */
export async function setupClonePage(page: Page): Promise<void> {
  page.setDefaultNavigationTimeout(90_000);
  page.setDefaultTimeout(45_000);

  await page.route("**/*", (route) => {
    const req = route.request();
    const type = req.resourceType();
    if (["image", "font", "media", "websocket", "eventsource"].includes(type)) {
      return route.abort();
    }
    if (BLOCKED_URL.test(req.url())) {
      return route.abort();
    }
    return route.continue();
  });
}

export async function waitForRenderablePage(page: Page): Promise<void> {
  await page.waitForLoadState("domcontentloaded", { timeout: 20_000 }).catch(() => {});
  await page
    .waitForFunction(() => (document.body?.innerText?.trim().length ?? 0) > 15, {
      timeout: 15_000,
    })
    .catch(() => {});
  await delay(1_000);
}
