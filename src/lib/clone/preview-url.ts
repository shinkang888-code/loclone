import type { CloneResult } from "@/types/clone";

/** 클론 HTML 미리보기 URL (서버리스: /api/clones, 로컬: /clones) */
export function getClonePreviewUrlFromRun(run: {
  runId: string | null;
  artifactDir: string | null;
}): string | null {
  if (!run.runId) return null;
  return run.artifactDir ?? `/api/clones/${run.runId}`;
}

export function getClonePreviewUrlFromResult(result: CloneResult): string {
  return `/api/clones/${result.runId}`;
}
