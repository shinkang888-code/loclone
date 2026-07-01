import type { Page } from "playwright";

const BLOCKED_URL =
  /google-analytics|googletagmanager|facebook\.net|hotjar|clarity\.ms|doubleclick\.net/i;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function setupClonePage(page: Page): Promise<void> {
  page.setDefaultNavigationTimeout(180_000);
  page.setDefaultTimeout(60_000);

  await page.route("**/*", (route) => {
    const req = route.request();
    const type = req.resourceType();
    if (["image", "font", "media", "websocket"].includes(type)) {
      return route.abort();
    }
    if (BLOCKED_URL.test(req.url())) {
      return route.abort();
    }
    return route.continue();
  });
}

export { delay };
