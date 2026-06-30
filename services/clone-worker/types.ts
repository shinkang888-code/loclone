export type CloneMode =
  | "static"
  | "render"
  | "full"
  | "mirror"
  | "spa-states";

export interface CloneOptions {
  maxDepth?: number;
  maxPages?: number;
  sameOriginOnly?: boolean;
  seedSitemaps?: boolean;
  browser?: "playwright" | "puppeteer";
  headless?: boolean;
}

export interface WorkerJobRequest {
  url: string;
  mode: CloneMode;
  options?: CloneOptions;
  locloneRunId: string;
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
  htmlContent?: string;
  metadataJson?: Record<string, unknown>;
  htmlBlobUrl?: string;
}

export interface LogEntry {
  ts: string;
  level: "info" | "warn" | "error";
  message: string;
}

export interface WorkerJob {
  jobId: string;
  request: WorkerJobRequest;
  status: "pending" | "running" | "success" | "failed";
  progress: number;
  error?: string;
  result?: CloneResult;
  logs: LogEntry[];
  createdAt: string;
}
