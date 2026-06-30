"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Maximize2,
  Monitor,
  Smartphone,
  Tablet,
  CheckCircle2,
  Download,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Viewport = "desktop" | "tablet" | "mobile";

const VIEWPORTS: { id: Viewport; label: string; width: string; icon: typeof Monitor }[] = [
  { id: "desktop", label: "데스크톱", width: "100%", icon: Monitor },
  { id: "tablet", label: "태블릿", width: "768px", icon: Tablet },
  { id: "mobile", label: "모바일", width: "390px", icon: Smartphone },
];

export function ClonePreviewPanel({
  previewUrl,
  title,
  sourceUrl,
  description,
  assetCount = 0,
  pagesCrawled,
  mode,
  projectId,
  className,
}: {
  previewUrl: string;
  title?: string | null;
  sourceUrl?: string;
  description?: string | null;
  assetCount?: number;
  pagesCrawled?: number | null;
  mode?: string;
  projectId?: string;
  className?: string;
}) {
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [fullscreen, setFullscreen] = useState(false);

  const activeWidth = useMemo(
    () => VIEWPORTS.find((v) => v.id === viewport)?.width ?? "100%",
    [viewport],
  );

  const openUrl = previewUrl.startsWith("http")
    ? previewUrl
    : `${typeof window !== "undefined" ? window.location.origin : ""}${previewUrl}`;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-[#4A7DB8]/25 bg-gradient-to-b from-[#141B26] to-[#1E2836] shadow-lg shadow-black/30",
        className,
      )}
    >
      <div className="border-b border-white/10 bg-[#1A2230]/80 px-5 py-4 backdrop-blur-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-[#4DA3FF]" aria-hidden />
              <h2 className="text-lg font-semibold text-foreground">
                클론 복사본이 준비되었습니다
              </h2>
              {mode && (
                <Badge variant="outline" className="font-normal">
                  {mode}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              원본 사이트의 HTML·에셋을 추출해 아래 미리보기에서 바로 확인할 수 있습니다.
              {sourceUrl && (
                <>
                  {" "}
                  <span className="text-foreground/80">원본:</span>{" "}
                  <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-[#6B9FD4] hover:underline"
                  >
                    {sourceUrl}
                  </a>
                </>
              )}
            </p>
            {title && (
              <p className="truncate text-base font-medium text-foreground">{title}</p>
            )}
            {description && (
              <p className="line-clamp-2 text-sm text-muted-foreground">{description}</p>
            )}
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span>에셋 {assetCount}개 저장</span>
              {pagesCrawled != null && pagesCrawled > 1 && (
                <span>페이지 {pagesCrawled}개</span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={openUrl}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <ExternalLink className="mr-1.5 h-4 w-4" />
              새 탭에서 열기
            </a>
            <Button variant="outline" size="sm" onClick={() => setFullscreen(true)}>
              <Maximize2 className="mr-1.5 h-4 w-4" />
              전체 화면
            </Button>
            {projectId && (
              <Link
                href={`/dashboard/projects/${projectId}/preview`}
                className={buttonVariants({ size: "sm" })}
              >
                원본과 비교
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/30 px-4 py-2">
        <div className="flex gap-1 rounded-lg border bg-background p-0.5">
          {VIEWPORTS.map((v) => {
            const Icon = v.icon;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setViewport(v.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition",
                  viewport === v.id
                    ? "bg-gradient-to-r from-[#4A7DB8] to-[#3D6B9A] text-white shadow-sm"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {v.label}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          <Download className="mr-1 inline h-3.5 w-3.5" />
          클라우드에 저장된 복사본 · 미리보기 전용
        </p>
      </div>

      <div className="flex justify-center bg-[#0B1018]/50 p-4 md:p-6">
        <div
          className="w-full transition-all duration-300"
          style={{ maxWidth: activeWidth }}
        >
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            <div className="flex items-center gap-2 border-b bg-slate-50 px-3 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span className="ml-2 flex-1 truncate rounded-md bg-white px-2 py-0.5 text-[10px] text-muted-foreground md:text-xs">
                {openUrl}
              </span>
            </div>
            <iframe
              src={previewUrl}
              title={title ?? "클론 미리보기"}
              className="block w-full bg-white"
              style={{ height: viewport === "mobile" ? 640 : 520 }}
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
          </div>
        </div>
      </div>

      {fullscreen && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/90 p-4"
          role="dialog"
          aria-modal
          aria-label="클론 전체 화면 미리보기"
        >
          <div className="mb-3 flex items-center justify-between text-white">
            <span className="truncate text-sm font-medium">{title ?? "클론 미리보기"}</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setFullscreen(false)}
            >
              닫기
            </Button>
          </div>
          <iframe
            src={previewUrl}
            title={title ?? "클론 미리보기"}
            className="min-h-0 flex-1 rounded-lg border-0 bg-white"
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        </div>
      )}
    </div>
  );
}
