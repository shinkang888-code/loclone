"use client";

import { ClonePreviewPanel } from "@/components/clone/clone-preview-panel";

export function PreviewCompare({
  sourceUrl,
  clonePath,
  cloneTitle,
  assetCount,
  mode,
  projectId,
}: {
  sourceUrl: string;
  clonePath?: string | null;
  cloneTitle?: string | null;
  assetCount?: number;
  mode?: string;
  projectId?: string;
}) {
  if (!clonePath) {
    return (
      <div className="rounded-2xl border border-dashed bg-muted/30 p-12 text-center">
        <p className="text-lg font-medium text-foreground">아직 클론 복사본이 없습니다</p>
        <p className="mt-2 text-sm text-muted-foreground">
          프로젝트 → 클론 탭에서 실행하면 이곳에 미리보기가 표시됩니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ClonePreviewPanel
        previewUrl={clonePath}
        title={cloneTitle}
        sourceUrl={sourceUrl}
        assetCount={assetCount ?? 0}
        mode={mode}
        projectId={projectId}
      />

      <div className="rounded-2xl border bg-card p-5">
        <p className="mb-3 text-sm font-semibold text-foreground">원본 사이트 (참고)</p>
        <p className="mb-3 text-xs text-muted-foreground">
          일부 사이트는 보안 정책(X-Frame-Options)으로 iframe에 표시되지 않을 수 있습니다.
        </p>
        <iframe
          src={sourceUrl}
          title="원본 사이트"
          className="h-[360px] w-full rounded-lg border bg-white"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
}
