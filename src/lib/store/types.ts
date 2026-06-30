export type UserRole = "user" | "staff" | "admin";

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export type ProjectStatus = "draft" | "active" | "archived";
export type FidelityLevel = "pixel-perfect" | "balanced" | "fast";

export interface Project {
  id: string;
  name: string;
  description: string | null;
  targetUrls: string[];
  status: ProjectStatus;
  fidelity: FidelityLevel;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type CloneRunStatus = "pending" | "running" | "success" | "failed";

export type CloneMode =
  | "static"
  | "render"
  | "full"
  | "mirror"
  | "spa-states"
  | "agent-pixel";

export interface CloneRunOptions {
  maxDepth?: number;
  maxPages?: number;
  sameOriginOnly?: boolean;
  seedSitemaps?: boolean;
  browser?: "playwright" | "puppeteer";
  scraperBackend?: "local" | "crawl4ai" | "firecrawl";
  headless?: boolean;
}

export interface CloneRun {
  id: string;
  projectId: string;
  url: string;
  mode: CloneMode;
  options: CloneRunOptions | null;
  status: CloneRunStatus;
  progress: number;
  finalUrl: string | null;
  error: string | null;
  runId: string | null;
  artifactDir: string | null;
  workerJobId: string | null;
  logPath: string | null;
  logs?: Array<{ ts: string; level: "info" | "warn" | "error"; message: string }>;
  startedAt: string;
  finishedAt: string | null;
}

export type ArtifactType = "html" | "meta" | "asset_list" | "screenshot" | "log";

export interface Artifact {
  id: string;
  runId: string;
  type: ArtifactType;
  path: string;
  metadata: Record<string, unknown> | null;
}

export type CloneStepName = "extract" | "foundation" | "section_build" | "polish" | "qa";

export interface CloneRunStep {
  id: string;
  runId: string;
  step: CloneStepName;
  status: CloneRunStatus;
  agentId: string | null;
  logPath: string | null;
  startedAt: string | null;
  finishedAt: string | null;
}

export interface QaReport {
  id: string;
  projectId: string;
  seoScore: number;
  perfScore: number;
  a11yScore: number;
  designScore?: number;
  designTokens?: string[];
  techStack?: string[];
  issues: QaIssue[];
  generatedAt: string;
}

export interface QaIssue {
  category: string;
  severity: "low" | "medium" | "high";
  message: string;
  fix?: string;
}

export type SiteStatus = "up" | "down" | "unknown";

export interface Site {
  id: string;
  projectId: string | null;
  name: string;
  url: string;
  status: SiteStatus;
  httpCode: number | null;
  lastChecked: string | null;
}

export interface Deployment {
  id: string;
  projectId: string;
  provider: string;
  url: string | null;
  status: string;
  createdAt: string;
}

export type WaitingCategory =
  | "credentials"
  | "deployment"
  | "billing"
  | "browser_mcp"
  | "database"
  | "clone_worker"
  | "other";

export interface WaitingItem {
  id: string;
  category: WaitingCategory;
  title: string;
  description: string;
  actionUrl?: string;
  envKeys?: string[];
  status: "pending" | "done";
  createdAt: string;
}

export interface Entitlements {
  userId: string;
  plan: string;
  cloneLimit: number;
  cloneUsed: number;
}

export interface LocloneDb {
  users: UserProfile[];
  projects: Project[];
  cloneRuns: CloneRun[];
  artifacts: Artifact[];
  cloneRunSteps: CloneRunStep[];
  qaReports: QaReport[];
  sites: Site[];
  deployments: Deployment[];
  waitingItems: WaitingItem[];
  entitlements: Entitlements[];
}
