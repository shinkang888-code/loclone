import type { CloneMode, CloneOptions, CloneResult } from "@/types/clone";

export interface WorkerJobRequest {
  url: string;
  mode: CloneMode;
  options?: CloneOptions;
  locloneRunId: string;
}

export interface WorkerJobStatus {
  jobId: string;
  status: "pending" | "running" | "success" | "failed";
  progress: number;
  error?: string;
  result?: CloneResult;
  logs?: Array<{ ts: string; level: string; message: string }>;
}

function workerBaseUrl(): string | null {
  const url = process.env.CLONE_WORKER_URL?.trim();
  return url || null;
}

export function isWorkerConfigured(): boolean {
  return Boolean(workerBaseUrl());
}

export async function createWorkerJob(
  request: WorkerJobRequest,
): Promise<WorkerJobStatus> {
  const base = workerBaseUrl();
  if (!base) {
    throw new Error("CLONE_WORKER_URL이 설정되지 않았습니다.");
  }

  const res = await fetch(`${base}/jobs`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Worker 오류: ${res.status} ${text}`);
  }

  return res.json() as Promise<WorkerJobStatus>;
}

export async function getWorkerJob(jobId: string): Promise<WorkerJobStatus> {
  const base = workerBaseUrl();
  if (!base) throw new Error("CLONE_WORKER_URL이 설정되지 않았습니다.");

  const res = await fetch(`${base}/jobs/${jobId}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Worker job 조회 실패: ${res.status}`);
  }
  return res.json() as Promise<WorkerJobStatus>;
}

export async function waitForWorkerJob(
  jobId: string,
  opts?: { pollMs?: number; timeoutMs?: number },
): Promise<WorkerJobStatus> {
  const pollMs = opts?.pollMs ?? 1500;
  const timeoutMs = opts?.timeoutMs ?? 300_000;
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const job = await getWorkerJob(jobId);
    if (job.status === "success" || job.status === "failed") {
      return job;
    }
    await new Promise((r) => setTimeout(r, pollMs));
  }

  throw new Error("Worker job 타임아웃");
}

export async function getWorkerHealth(): Promise<{
  ok: boolean;
  browserPool?: { active: number; max: number };
  queueDepth?: number;
  version?: string;
} | null> {
  const base = workerBaseUrl();
  if (!base) return null;

  try {
    const res = await fetch(`${base}/health`, { cache: "no-store" });
    if (!res.ok) return { ok: false };
    return res.json();
  } catch {
    return { ok: false };
  }
}

export async function cancelWorkerJob(jobId: string): Promise<void> {
  const base = workerBaseUrl();
  if (!base) return;
  await fetch(`${base}/jobs/${jobId}/cancel`, { method: "POST" });
}
