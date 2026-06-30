export type CloneMode =
  | "static"
  | "render"
  | "full"
  | "mirror"
  | "spa-states"
  | "agent-pixel";

export type ScraperBackend = "local" | "crawl4ai" | "firecrawl";

export interface CloneOptions {
  maxDepth?: number;
  maxPages?: number;
  sameOriginOnly?: boolean;
  seedSitemaps?: boolean;
  browser?: "playwright" | "puppeteer";
  scraperBackend?: ScraperBackend;
  headless?: boolean;
}

export interface CloneModeMeta {
  id: CloneMode;
  label: string;
  description: string;
  needsWorker: boolean;
  needsHuman: boolean;
}

export const CLONE_MODES: CloneModeMeta[] = [
  {
    id: "static",
    label: "빠른 추출",
    description: "fetch + HTML 파싱 (정적 페이지)",
    needsWorker: false,
    needsHuman: false,
  },
  {
    id: "render",
    label: "JS 렌더",
    description: "Playwright 단일 페이지 + 에셋 가로채기",
    needsWorker: true,
    needsHuman: false,
  },
  {
    id: "full",
    label: "소형 사이트",
    description: "BFS depth 2, same-origin",
    needsWorker: true,
    needsHuman: false,
  },
  {
    id: "mirror",
    label: "미러",
    description: "BFS depth 5 + sitemap 시드",
    needsWorker: true,
    needsHuman: false,
  },
  {
    id: "spa-states",
    label: "SPA 상태",
    description: "상태 트리 탐색 (experimental)",
    needsWorker: true,
    needsHuman: false,
  },
  {
    id: "agent-pixel",
    label: "AI 픽셀",
    description: "Browser MCP + /clone-website 스킬",
    needsWorker: false,
    needsHuman: true,
  },
];

export const MODE_PRESETS: Record<CloneMode, CloneOptions> = {
  static: { headless: true },
  render: { headless: true, browser: "playwright", scraperBackend: "local" },
  full: { maxDepth: 2, maxPages: 30, sameOriginOnly: true, headless: true },
  mirror: {
    maxDepth: 5,
    maxPages: 50,
    sameOriginOnly: true,
    seedSitemaps: true,
    headless: true,
  },
  "spa-states": { maxDepth: 3, maxPages: 20, headless: true },
  "agent-pixel": { headless: true },
};

export function modeNeedsWorker(mode: CloneMode): boolean {
  return CLONE_MODES.find((m) => m.id === mode)?.needsWorker ?? false;
}

export function modeNeedsHuman(mode: CloneMode): boolean {
  return CLONE_MODES.find((m) => m.id === mode)?.needsHuman ?? false;
}

export interface CloneRequest {
  url: string;
  mode?: CloneMode;
  options?: CloneOptions;
}

export interface ExtractedSiteData {
  finalUrl: string;
  title: string;
  description: string | null;
  ogImage: string | null;
  html: string;
  assetUrls: string[];
}

export interface SavedAssetInfo {
  sourceUrl: string;
  localPath: string;
}

export interface CloneResult {
  runId: string;
  sourceUrl: string;
  finalUrl: string;
  title: string;
  description: string | null;
  ogImage: string | null;
  htmlSnapshotPath: string;
  metadataPath: string;
  downloadedAssets: SavedAssetInfo[];
  pagesCrawled?: number;
  /** Neon persistence on Vercel (no durable disk) */
  htmlContent?: string;
  metadataJson?: Record<string, unknown>;
  /** Vercel Blob public URL for full HTML */
  htmlBlobUrl?: string;
}

export interface CloneResponse {
  ok: boolean;
  result?: CloneResult;
  run?: import("@/lib/store/types").CloneRun;
  error?: string;
  waitingRequired?: boolean;
}
