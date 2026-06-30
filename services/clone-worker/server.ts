import http from "node:http";
import { createJob, getJob, listJobs, queueDepth } from "./lib/jobs.js";
import { processJob, browserPoolStats, shutdownBrowser } from "./lib/processor.js";
import type { WorkerJobRequest } from "./types.js";

const PORT = Number(process.env.PORT ?? process.env.CLONE_WORKER_PORT ?? 3100);
const HOST = process.env.CLONE_WORKER_HOST ?? "0.0.0.0";

const jobQueue: string[] = [];
let queueRunning = false;

async function drainJobQueue(): Promise<void> {
  if (queueRunning) return;
  queueRunning = true;
  try {
    while (jobQueue.length > 0) {
      const jobId = jobQueue.shift()!;
      await processJob(jobId);
    }
  } finally {
    queueRunning = false;
    if (jobQueue.length > 0) {
      void drainJobQueue();
    }
  }
}

function enqueueJob(jobId: string): void {
  jobQueue.push(jobId);
  void drainJobQueue();
}

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    req.on("error", reject);
  });
}

function json(res: http.ServerResponse, status: number, data: unknown) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);
  const method = req.method ?? "GET";

  if (method === "GET" && url.pathname === "/health") {
    return json(res, 200, {
      ok: true,
      version: "0.1.1",
      browserPool: browserPoolStats(),
      queueDepth: queueDepth(),
      pendingInQueue: jobQueue.length,
    });
  }

  if (method === "POST" && url.pathname === "/jobs") {
    try {
      const body = JSON.parse(await readBody(req)) as WorkerJobRequest;
      const job = createJob(body);
      enqueueJob(job.jobId);
      return json(res, 202, {
        jobId: job.jobId,
        status: job.status,
        progress: job.progress,
      });
    } catch (e) {
      return json(res, 400, { error: e instanceof Error ? e.message : "bad request" });
    }
  }

  const jobMatch = url.pathname.match(/^\/jobs\/([^/]+)$/);
  if (method === "GET" && jobMatch) {
    const job = getJob(jobMatch[1]!);
    if (!job) return json(res, 404, { error: "NOT_FOUND" });
    return json(res, 200, {
      jobId: job.jobId,
      status: job.status,
      progress: job.progress,
      error: job.error,
      result: job.result,
      logs: job.logs,
    });
  }

  const logsMatch = url.pathname.match(/^\/jobs\/([^/]+)\/logs$/);
  if (method === "GET" && logsMatch) {
    const job = getJob(logsMatch[1]!);
    if (!job) return json(res, 404, { error: "NOT_FOUND" });

    if (req.headers.accept?.includes("text/event-stream")) {
      res.writeHead(200, {
        "content-type": "text/event-stream",
        "cache-control": "no-cache",
        connection: "keep-alive",
      });
      let last = 0;
      const interval = setInterval(() => {
        while (last < job.logs.length) {
          res.write(`data: ${JSON.stringify(job.logs[last])}\n\n`);
          last += 1;
        }
        if (job.status === "success" || job.status === "failed") {
          res.write(
            `data: ${JSON.stringify({ ts: new Date().toISOString(), level: "info", message: "DONE" })}\n\n`,
          );
          clearInterval(interval);
          res.end();
        }
      }, 500);
      req.on("close", () => clearInterval(interval));
      return;
    }

    return json(res, 200, { logs: job.logs });
  }

  const cancelMatch = url.pathname.match(/^\/jobs\/([^/]+)\/cancel$/);
  if (method === "POST" && cancelMatch) {
    return json(res, 200, { ok: true });
  }

  if (method === "GET" && url.pathname === "/jobs") {
    return json(res, 200, { jobs: listJobs().map((j) => ({ jobId: j.jobId, status: j.status })) });
  }

  json(res, 404, { error: "NOT_FOUND" });
});

server.listen(PORT, HOST, () => {
  console.log(`Lclone Clone Worker listening on ${HOST}:${PORT}`);
  console.log(`LOCLONE_ROOT=${process.env.LOCLONE_ROOT ?? "(auto ../..)"}`);
  console.log(`RENDER=${process.env.RENDER ?? "false"} perJobBrowser=${process.env.WORKER_BROWSER_PER_JOB ?? "auto"}`);
});

process.on("SIGTERM", async () => {
  await shutdownBrowser();
  process.exit(0);
});
