import path from "node:path";

/** Vercel / AWS Lambda — read-only except /tmp */
export function isServerlessRuntime(): boolean {
  return (
    process.env.VERCEL === "1" ||
    Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
    Boolean(process.env.VERCEL_ENV)
  );
}

/** Writable root: /tmp/loclone on serverless, storage/runtime locally */
export function getWritableRoot(): string {
  if (isServerlessRuntime()) {
    return path.join("/tmp", "loclone");
  }
  return path.join(process.cwd(), "storage", "runtime");
}

export function getLogsDir(): string {
  return path.join(getWritableRoot(), "logs");
}

export function getClonesDir(): string {
  if (isServerlessRuntime()) {
    return path.join(getWritableRoot(), "clones");
  }
  return path.join(process.cwd(), "public", "clones");
}

export function getResearchRunsDir(): string {
  if (isServerlessRuntime()) {
    return path.join(getWritableRoot(), "research", "runs");
  }
  return path.join(process.cwd(), "docs", "research", "runs");
}

export function getExportsDir(): string {
  return path.join(getWritableRoot(), "exports");
}

/** Public URL path for clone preview (served via API on serverless) */
export function getClonePublicPath(resultRunId: string): string {
  if (isServerlessRuntime()) {
    return `/api/clones/${resultRunId}`;
  }
  return `/clones/${resultRunId}`;
}
