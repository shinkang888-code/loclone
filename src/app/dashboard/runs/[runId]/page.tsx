"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArtifactList, type ArtifactWithContent } from "@/components/clone/artifact-list";
import { ClonePreviewPanel } from "@/components/clone/clone-preview-panel";
import { RunLogViewer } from "@/components/clone/run-log-viewer";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getClonePreviewUrlFromRun } from "@/lib/clone/preview-url";
import { cn } from "@/lib/utils";
import type { CloneRun, CloneRunStep, Project } from "@/lib/store/types";

type TabId = "preview" | "logs" | "artifacts";

export default function RunDetailPage() {
  const params = useParams();
  const runId = params.runId as string;
  const [run, setRun] = useState<CloneRun | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [steps, setSteps] = useState<CloneRunStep[]>([]);
  const [artifacts, setArtifacts] = useState<ArtifactWithContent[]>([]);
  const [tab, setTab] = useState<TabId>("preview");

  const load = useCallback(async () => {
    const [detailRes, artRes] = await Promise.all([
      fetch(`/api/runs/${runId}`),
      fetch(`/api/runs/${runId}/artifacts`),
    ]);
    const detail = await detailRes.json();
    const art = await artRes.json();
    if (detail.ok) {
      setRun(detail.run);
      setProject(detail.project ?? null);
      setSteps(detail.steps ?? []);
    }
    if (art.ok) setArtifacts(art.artifacts);
  }, [runId]);

  useEffect(() => {
    load();
  }, [load]);

  if (!run) return <p className="text-muted-foreground">불러오는 중…</p>;

  const previewUrl = getClonePreviewUrlFromRun(run);
  const metaArtifact = artifacts.find((a) => a.type === "meta");
  const metaTitle =
    (metaArtifact?.metadata?.title as string | undefined) ??
    (metaArtifact?.metadata?.metadataJson as { title?: string } | undefined)?.title;
  const metaDescription =
    (metaArtifact?.metadata?.description as string | undefined) ??
    (metaArtifact?.metadata?.metadataJson as { description?: string } | undefined)
      ?.description;
  const assetList = artifacts.find((a) => a.type === "asset_list");
  const assetCount =
    (assetList?.metadata?.assets as unknown[] | undefined)?.length ??
    (metaArtifact?.metadata?.metadataJson as { downloadedAssets?: unknown[] } | undefined)
      ?.downloadedAssets?.length ??
    0;

  const tabs: { id: TabId; label: string }[] = [
    { id: "preview", label: "미리보기" },
    { id: "logs", label: "실행 로그" },
    { id: "artifacts", label: "기술 아티팩트" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">클론 결과</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {project ? (
              <>
                <Link
                  href={`/dashboard/projects/${project.id}`}
                  className="font-medium text-indigo-600 hover:underline"
                >
                  {project.name}
                </Link>
                {" · "}
              </>
            ) : null}
            추출된 사이트 복사본을 미리보기에서 확인하세요.
          </p>
        </div>
        {project && (
          <Link
            href={`/dashboard/projects/${project.id}/clone`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            다시 클론
          </Link>
        )}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <Badge
          variant={run.status === "success" ? "success" : "outline"}
        >
          {run.status}
        </Badge>
        <Badge variant="outline">{run.mode}</Badge>
        <span className="text-sm text-muted-foreground">진행 {run.progress}%</span>
        <span className="truncate text-sm font-mono text-muted-foreground">{run.url}</span>
      </div>

      {run.error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {run.error}
        </p>
      )}

      {run.status === "success" && previewUrl ? (
        <ClonePreviewPanel
          previewUrl={previewUrl}
          title={metaTitle ?? null}
          sourceUrl={run.url}
          description={metaDescription ?? null}
          assetCount={assetCount}
          mode={run.mode}
          projectId={project?.id}
        />
      ) : run.status !== "failed" ? (
        <div className="rounded-xl border border-dashed bg-muted/30 p-10 text-center text-sm text-muted-foreground">
          클론이 완료되면 이곳에 사이트 복사본 미리보기가 표시됩니다.
        </div>
      ) : null}

      <div className="rounded-2xl border bg-card shadow-sm">
        <div className="flex gap-1 border-b p-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition",
                tab === t.id
                  ? "bg-indigo-600 text-white"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === "preview" && run.status === "success" && previewUrl && (
            <p className="text-sm text-muted-foreground">
              위 미리보기에서 클론 복사본을 확인했습니다. 원본과 나란히 비교하려면{" "}
              {project ? (
                <Link
                  href={`/dashboard/projects/${project.id}/preview`}
                  className="font-medium text-indigo-600 underline"
                >
                  프로젝트 프리뷰
                </Link>
              ) : (
                "프로젝트 프리뷰"
              )}
              로 이동하세요.
            </p>
          )}

          {tab === "preview" && run.status !== "success" && (
            <p className="text-sm text-muted-foreground">클론 성공 후 미리보기가 활성화됩니다.</p>
          )}

          {tab === "logs" && (
            <div className="space-y-4">
              <RunLogViewer runId={runId} />
              {run.workerJobId && (
                <p className="text-xs text-muted-foreground">Worker Job: {run.workerJobId}</p>
              )}
              <div>
                <h3 className="mb-2 text-sm font-semibold">빌드 단계</h3>
                <ul className="space-y-1 text-sm">
                  {steps.map((s) => (
                    <li key={s.id}>
                      {s.step} — {s.status}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {tab === "artifacts" && (
            <div>
              <p className="mb-4 text-xs text-muted-foreground">
                개발·납품용 파일 경로 및 메타데이터입니다. 고객 미리보기는 상단 패널을 사용하세요.
              </p>
              <ArtifactList artifacts={artifacts} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
