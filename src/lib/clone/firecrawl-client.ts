import type { CloneMode, CloneOptions } from "@/types/clone";

const DEFAULT_BASE = "https://api.firecrawl.dev/v1";

export function isFirecrawlConfigured(): boolean {
  return Boolean(process.env.FIRECRAWL_API_KEY?.trim());
}

function apiBase(): string {
  return process.env.FIRECRAWL_API_URL?.trim() || DEFAULT_BASE;
}

function apiKey(): string {
  const key = process.env.FIRECRAWL_API_KEY?.trim();
  if (!key) throw new Error("FIRECRAWL_API_KEY가 설정되지 않았습니다.");
  return key;
}

type FirecrawlMetadata = {
  title?: string;
  description?: string;
  ogImage?: string;
  sourceURL?: string;
  url?: string;
  statusCode?: number;
};

type FirecrawlPage = {
  rawHtml?: string;
  html?: string;
  markdown?: string;
  metadata?: FirecrawlMetadata;
  url?: string;
};

type ScrapeResponse = {
  success: boolean;
  error?: string;
  data?: FirecrawlPage;
};

type CrawlStartResponse = {
  success: boolean;
  error?: string;
  id?: string;
  url?: string;
};

type CrawlStatusResponse = {
  success: boolean;
  status: "scraping" | "completed" | "failed" | "cancelled";
  error?: string;
  completed?: number;
  total?: number;
  data?: FirecrawlPage[];
};

function scrapeBody(url: string, options?: CloneOptions) {
  return {
    url,
    formats: ["rawHtml", "html", "markdown"],
    onlyMainContent: false,
    waitFor: options?.headless === false ? 5000 : 3000,
    timeout: 90_000,
    location: { country: "KR", languages: ["ko-KR"] },
  };
}

async function firecrawlFetch<T>(
  path: string,
  init?: RequestInit & { json?: unknown },
): Promise<T> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey()}`,
  };
  let body: string | undefined;
  if (init?.json !== undefined) {
    headers["content-type"] = "application/json";
    body = JSON.stringify(init.json);
  }

  const res = await fetch(`${apiBase()}${path}`, {
    method: init?.method ?? (init?.json ? "POST" : "GET"),
    headers,
    body,
    signal: AbortSignal.timeout(120_000),
  });

  const payload = (await res.json()) as T & { error?: string };
  if (!res.ok) {
    throw new Error(payload.error ?? `Firecrawl HTTP ${res.status}`);
  }
  return payload;
}

export async function firecrawlScrape(
  url: string,
  options?: CloneOptions,
): Promise<FirecrawlPage> {
  const res = await firecrawlFetch<ScrapeResponse>("/scrape", {
    json: scrapeBody(url, options),
  });
  if (!res.success || !res.data) {
    throw new Error(res.error ?? "Firecrawl scrape 실패");
  }
  return res.data;
}

export async function firecrawlCrawl(
  startUrl: string,
  options?: CloneOptions,
  mode: CloneMode = "mirror",
): Promise<FirecrawlPage[]> {
  const limit =
    options?.maxPages ?? (mode === "mirror" ? 50 : mode === "full" ? 30 : 15);

  const started = await firecrawlFetch<CrawlStartResponse>("/crawl", {
    json: {
      url: startUrl,
      limit,
      scrapeOptions: scrapeBody(startUrl, options),
      maxDepth: options?.maxDepth ?? (mode === "mirror" ? 5 : 2),
    },
  });

  if (!started.success || !started.id) {
    throw new Error(started.error ?? "Firecrawl crawl 시작 실패");
  }

  const jobId = started.id;
  const deadline = Date.now() + 360_000;

  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 3_000));
    const status = await firecrawlFetch<CrawlStatusResponse>(`/crawl/${jobId}`);

    if (status.status === "completed" && status.data?.length) {
      return status.data;
    }
    if (status.status === "failed" || status.status === "cancelled") {
      throw new Error(status.error ?? `Firecrawl crawl ${status.status}`);
    }
  }

  throw new Error("Firecrawl crawl 타임아웃");
}

export function pageHtml(page: FirecrawlPage): string {
  return page.rawHtml ?? page.html ?? page.markdown ?? "";
}

export function pageUrl(page: FirecrawlPage, fallback: string): string {
  return page.metadata?.sourceURL ?? page.metadata?.url ?? page.url ?? fallback;
}

export function pageTitle(page: FirecrawlPage): string {
  return page.metadata?.title?.trim() || "Untitled";
}

export function pageDescription(page: FirecrawlPage): string | null {
  return page.metadata?.description?.trim() ?? null;
}

export function pageOgImage(page: FirecrawlPage): string | null {
  return page.metadata?.ogImage?.trim() ?? null;
}
