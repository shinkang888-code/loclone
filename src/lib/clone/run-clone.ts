import { extractSiteData } from "@/lib/clone/extract";
import { saveCloneArtifacts } from "@/lib/clone/artifacts";
import { appendRunLog } from "@/lib/clone/logs";
import { normalizeUrl } from "@/lib/clone/normalize-url";
import { ensureWaitingForMode } from "@/lib/clone/waiting-bridge";
import {
  createWorkerJob,
  isWorkerConfigured,
  waitForWorkerJob,
} from "@/lib/clone/worker-client";
import { newId, readDb, writeDb } from "@/lib/store/file-store";
import type { CloneRun, Artifact } from "@/lib/store/types";
import type { CloneResult, CloneMode, CloneOptions } from "@/types/clone";
import { getClonePublicPath } from "@/lib/storage/paths";
import { MODE_PRESETS, modeNeedsHuman, modeNeedsWorker } from "@/types/clone";

const FETCH_TIMEOUT_MS = 20_000;

function mergeOptions(mode: CloneMode, options?: CloneOptions): CloneOptions {
  return { ...MODE_PRESETS[mode], ...options };
}

async function runStaticClone(
  targetUrl: string,
  runId: string,
): Promise<{ result: CloneResult }> {
  await appendRunLog(runId, "static: fetch 시작");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  const response = await fetch(targetUrl, {
    signal: controller.signal,
    redirect: "follow",
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
    },
  }).finally(() => clearTimeout(timeout));

  if (!response.ok) {
    throw new Error(`대상 페이지 요청 실패: ${response.status}`);
  }

  const html = await response.text();
  const extracted = extractSiteData(html, targetUrl, response.url);
  await appendRunLog(runId, `static: 에셋 ${extracted.assetUrls.length}개 감지`);
  const result = await saveCloneArtifacts(targetUrl, extracted);
  await appendRunLog(runId, "static: 아티팩트 저장 완료");
  return { result };
}

async function runWorkerClone(
  targetUrl: string,
  mode: CloneMode,
  options: CloneOptions,
  locloneRunId: string,
): Promise<{ result: CloneResult; workerJobId: string }> {
  if (!isWorkerConfigured()) {
    throw new Error("Clone Worker가 실행되지 않았습니다. /dashboard/waiting 을 확인하세요.");
  }

  if (options.scraperBackend === "firecrawl" || options.scraperBackend === "crawl4ai") {
    throw new Error(
      `${options.scraperBackend} 백엔드는 API 키 설정 후 사용 가능합니다. /dashboard/waiting 참고.`,
    );
  }

  await appendRunLog(locloneRunId, `worker: ${mode} job 생성`);
  const created = await createWorkerJob({
    url: targetUrl,
    mode,
    options,
    locloneRunId,
  });

  await appendRunLog(locloneRunId, `worker: jobId=${created.jobId}`);
  const finished = await waitForWorkerJob(created.jobId);

  if (finished.status === "failed" || !finished.result) {
    throw new Error(finished.error ?? "Worker 클론 실패");
  }

  await appendRunLog(locloneRunId, "worker: 완료");
  return { result: finished.result, workerJobId: created.jobId };
}

function buildArtifacts(runId: string, result: CloneResult): Artifact[] {
  const htmlMeta: Record<string, unknown> = { title: result.title };
  if (result.htmlContent) {
    htmlMeta.htmlContent = result.htmlContent;
  }
  if (result.htmlBlobUrl) {
    htmlMeta.htmlBlobUrl = result.htmlBlobUrl;
  }

  const metaPayload: Record<string, unknown> = {
    title: result.title,
    description: result.description,
    ogImage: result.ogImage,
    pagesCrawled: result.pagesCrawled,
  };
  if (result.metadataJson) {
    metaPayload.metadataJson = result.metadataJson;
  }

  return [
    {
      id: newId(),
      runId,
      type: "html",
      path: result.htmlSnapshotPath,
      metadata: htmlMeta,
    },
    {
      id: newId(),
      runId,
      type: "meta",
      path: result.metadataPath,
      metadata: metaPayload,
    },
    {
      id: newId(),
      runId,
      type: "asset_list",
      path: result.metadataPath,
      metadata: { assets: result.downloadedAssets },
    },
  ];
}

export async function runCloneForProject(
  projectId: string,
  rawUrl: string,
  userId: string,
  mode: CloneMode = "static",
  rawOptions?: CloneOptions,
): Promise<{ run: CloneRun; result?: CloneResult; waitingHint?: string }> {
  const db = await readDb();
  const project = db.projects.find((p) => p.id === projectId);
  if (!project) {
    throw new Error("프로젝트를 찾을 수 없습니다.");
  }

  const entitlement = db.entitlements.find((e) => e.userId === userId);
  if (entitlement && entitlement.cloneUsed >= entitlement.cloneLimit) {
    throw new Error("클론 사용 한도에 도달했습니다.");
  }

  const options = mergeOptions(mode, rawOptions);
  const waitingHint = await ensureWaitingForMode(mode, options);

  if (modeNeedsWorker(mode) && !isWorkerConfigured()) {
    throw new Error(
      `${mode} 모드는 Clone Worker가 필요합니다. docker compose up clone-worker 후 CLONE_WORKER_URL을 설정하거나 /dashboard/waiting을 확인하세요.`,
    );
  }

  const runId = newId();
  const startedAt = new Date().toISOString();
  const targetUrl = normalizeUrl(rawUrl);
  const initialLog = `clone 시작 mode=${mode} url=${targetUrl}`;

  await writeDb((d) => {
    d.cloneRuns.push({
      id: runId,
      projectId,
      url: targetUrl,
      mode,
      options,
      status: "running",
      progress: 5,
      finalUrl: null,
      error: null,
      runId: null,
      artifactDir: null,
      workerJobId: null,
      logPath: null,
      logs: [
        {
          ts: startedAt,
          level: "info",
          message: initialLog,
        },
      ],
      startedAt,
      finishedAt: null,
    });
    if (entitlement) {
      entitlement.cloneUsed += 1;
    }
  });

  const logPath = await appendRunLog(runId, initialLog);
  await writeDb((d) => {
    const run = d.cloneRuns.find((r) => r.id === runId);
    if (run) run.logPath = logPath;
  });

  try {
    let result: CloneResult | undefined;
    let workerJobId: string | null = null;

    if (mode === "agent-pixel") {
      await writeDb((d) => {
        const run = d.cloneRuns.find((r) => r.id === runId);
        if (run) {
          run.status = "pending";
          run.progress = 10;
          run.error = null;
          run.finishedAt = null;
        }
        d.cloneRunSteps.push({
          id: newId(),
          runId,
          step: "extract",
          status: "pending",
          agentId: null,
          logPath,
          startedAt: startedAt,
          finishedAt: null,
        });
        d.cloneRunSteps.push({
          id: newId(),
          runId,
          step: "foundation",
          status: "pending",
          agentId: null,
          logPath: null,
          startedAt: null,
          finishedAt: null,
        });
      });
      await appendRunLog(
        runId,
        "agent-pixel: Browser MCP + /clone-website 스킬 실행 대기",
        "warn",
      );
      const dbAfter = await readDb();
      const run = dbAfter.cloneRuns.find((r) => r.id === runId)!;
      return { run, waitingHint: waitingHint ?? "/dashboard/waiting" };
    }

    if (mode === "static") {
      const staticResult = await runStaticClone(targetUrl, runId);
      result = staticResult.result;
    } else if (modeNeedsWorker(mode)) {
      const workerResult = await runWorkerClone(targetUrl, mode, options, runId);
      result = workerResult.result;
      workerJobId = workerResult.workerJobId;
    }

    if (!result) {
      throw new Error("클론 결과가 없습니다.");
    }

    const artifacts = buildArtifacts(runId, result);

    await writeDb((d) => {
      const run = d.cloneRuns.find((r) => r.id === runId);
      if (run) {
        run.status = "success";
        run.progress = 100;
        run.finalUrl = result!.finalUrl;
        run.runId = result!.runId;
        run.artifactDir = getClonePublicPath(result!.runId);
        run.workerJobId = workerJobId;
        run.finishedAt = new Date().toISOString();
      }
      d.artifacts.push(...artifacts);
      d.cloneRunSteps.push(
        {
          id: newId(),
          runId,
          step: "extract",
          status: "success",
          agentId: null,
          logPath: result!.metadataPath,
          startedAt: startedAt,
          finishedAt: new Date().toISOString(),
        },
        {
          id: newId(),
          runId,
          step: "foundation",
          status: modeNeedsHuman(mode) ? "pending" : "pending",
          agentId: null,
          logPath: null,
          startedAt: null,
          finishedAt: null,
        },
      );
    });

    const dbAfter = await readDb();
    const run = dbAfter.cloneRuns.find((r) => r.id === runId)!;
    return { run, result, waitingHint: waitingHint ?? undefined };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "클로닝 처리 중 오류가 발생했습니다.";
    await appendRunLog(runId, message, "error");
    await writeDb((d) => {
      const run = d.cloneRuns.find((r) => r.id === runId);
      if (run) {
        run.status = "failed";
        run.error = message;
        run.finishedAt = new Date().toISOString();
      }
    });
    throw new Error(message);
  }
}
