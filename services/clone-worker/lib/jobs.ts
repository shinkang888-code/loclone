import { randomUUID } from "node:crypto";
import type { WorkerJob, WorkerJobRequest, LogEntry } from "../types.js";

const jobs = new Map<string, WorkerJob>();

export function createJob(request: WorkerJobRequest): WorkerJob {
  const job: WorkerJob = {
    jobId: randomUUID(),
    request,
    status: "pending",
    progress: 0,
    logs: [],
    createdAt: new Date().toISOString(),
  };
  jobs.set(job.jobId, job);
  return job;
}

export function getJob(jobId: string): WorkerJob | undefined {
  return jobs.get(jobId);
}

export function appendLog(
  job: WorkerJob,
  message: string,
  level: LogEntry["level"] = "info",
): void {
  job.logs.push({ ts: new Date().toISOString(), level, message });
}

export function updateJob(
  jobId: string,
  patch: Partial<Pick<WorkerJob, "status" | "progress" | "error" | "result">>,
): WorkerJob | undefined {
  const job = jobs.get(jobId);
  if (!job) return undefined;
  Object.assign(job, patch);
  return job;
}

export function listJobs(): WorkerJob[] {
  return [...jobs.values()];
}

export function queueDepth(): number {
  return [...jobs.values()].filter((j) => j.status === "pending" || j.status === "running")
    .length;
}
