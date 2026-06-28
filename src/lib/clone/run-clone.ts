import { extractSiteData } from "@/lib/clone/extract";
import { saveCloneArtifacts } from "@/lib/clone/artifacts";
import { normalizeUrl } from "@/lib/clone/normalize-url";
import { newId, readDb, writeDb } from "@/lib/store/file-store";
import type { CloneRun, Artifact } from "@/lib/store/types";
import type { CloneResult } from "@/types/clone";

const FETCH_TIMEOUT_MS = 20_000;

export async function runCloneForProject(
  projectId: string,
  rawUrl: string,
  userId: string,
): Promise<{ run: CloneRun; result: CloneResult }> {
  const db = await readDb();
  const project = db.projects.find((p) => p.id === projectId);
  if (!project) {
    throw new Error("프로젝트를 찾을 수 없습니다.");
  }

  const entitlement = db.entitlements.find((e) => e.userId === userId);
  if (entitlement && entitlement.cloneUsed >= entitlement.cloneLimit) {
    throw new Error("클론 사용 한도에 도달했습니다.");
  }

  const runId = newId();
  const startedAt = new Date().toISOString();
  const targetUrl = normalizeUrl(rawUrl);

  await writeDb((d) => {
    d.cloneRuns.push({
      id: runId,
      projectId,
      url: targetUrl,
      status: "running",
      finalUrl: null,
      error: null,
      runId: null,
      artifactDir: null,
      startedAt,
      finishedAt: null,
    });
    if (entitlement) {
      entitlement.cloneUsed += 1;
    }
  });

  try {
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
    const result = await saveCloneArtifacts(targetUrl, extracted);

    const artifacts: Artifact[] = [
      {
        id: newId(),
        runId,
        type: "html",
        path: result.htmlSnapshotPath,
        metadata: { title: result.title },
      },
      {
        id: newId(),
        runId,
        type: "meta",
        path: result.metadataPath,
        metadata: {
          title: result.title,
          description: result.description,
          ogImage: result.ogImage,
        },
      },
      {
        id: newId(),
        runId,
        type: "asset_list",
        path: result.metadataPath,
        metadata: { assets: result.downloadedAssets },
      },
    ];

    await writeDb((d) => {
      const run = d.cloneRuns.find((r) => r.id === runId);
      if (run) {
        run.status = "success";
        run.finalUrl = result.finalUrl;
        run.runId = result.runId;
        run.artifactDir = `public/clones/${result.runId}`;
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
          logPath: result.metadataPath,
          startedAt: startedAt,
          finishedAt: new Date().toISOString(),
        },
        {
          id: newId(),
          runId,
          step: "foundation",
          status: "pending",
          agentId: null,
          logPath: null,
          startedAt: null,
          finishedAt: null,
        },
      );
    });

    const dbAfter = await readDb();
    const run = dbAfter.cloneRuns.find((r) => r.id === runId)!;
    return { run, result };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "클로닝 처리 중 오류가 발생했습니다.";
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
