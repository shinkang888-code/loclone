"use client";

export function PreviewCompare({
  sourceUrl,
  clonePath,
}: {
  sourceUrl: string;
  clonePath?: string | null;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div>
        <p className="mb-2 text-sm font-medium">원본 (iframe)</p>
        <iframe
          src={sourceUrl}
          title="source"
          className="h-[480px] w-full rounded-lg border bg-white"
          sandbox="allow-scripts allow-same-origin"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          X-Frame-Options로 차단될 수 있습니다. 스크린샷은 에이전트 스킬로 추출하세요.
        </p>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium">클론 프리뷰</p>
        {clonePath ? (
          <iframe
            src={clonePath}
            title="clone"
            className="h-[480px] w-full rounded-lg border bg-white"
          />
        ) : (
          <div className="flex h-[480px] items-center justify-center rounded-lg border bg-muted text-sm text-muted-foreground">
            클론 빌드 후 public/clones 경로가 표시됩니다.
          </div>
        )}
      </div>
    </div>
  );
}
