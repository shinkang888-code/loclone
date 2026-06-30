"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModeSelector } from "@/components/clone/mode-selector";
import { ClonePreviewPanel } from "@/components/clone/clone-preview-panel";
import { SectionHeading } from "@/components/dashboard/section-heading";
import {
  getClonePreviewUrlFromResult,
  getClonePreviewUrlFromRun,
} from "@/lib/clone/preview-url";
import type { CloneResult, CloneMode, CloneOptions } from "@/types/clone";
import { MODE_PRESETS } from "@/types/clone";
import type { CloneRun } from "@/lib/store/types";

export function CloneRunner({
  projectId,
  defaultUrl,
}: {
  projectId: string;
  defaultUrl?: string;
}) {
  const [url, setUrl] = useState(defaultUrl ?? "https://www.apple.com");
  const [mode, setMode] = useState<CloneMode>("static");
  const [options, setOptions] = useState<CloneOptions>(MODE_PRESETS.static);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [run, setRun] = useState<CloneRun | null>(null);
  const [result, setResult] = useState<CloneResult | null>(null);
  const [waitingHint, setWaitingHint] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const previewUrl =
    (run && getClonePreviewUrlFromRun(run)) ??
    (result ? getClonePreviewUrlFromResult(result) : null);

  useEffect(() => {
    if (run?.status === "success" && previewUrl && previewRef.current) {
      previewRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [run?.status, previewUrl]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setWaitingHint(null);
    setRun(null);
    setResult(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/clone`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url, mode, options }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? "클론 실패");
      setRun(data.run);
      setResult(data.result ?? null);
      if (data.waitingHint) setWaitingHint(data.waitingHint);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#141B26] to-[#1E2836]">
        <div className="grid gap-4 p-6 md:grid-cols-[1fr_180px] md:items-center">
          <div>
            <SectionHeading
              title="클론 실행"
              description="① 모드 선택 → ② URL 입력 → ③ 실행. 완료되면 바로 아래에서 복사본 미리보기가 열립니다."
            />
            <Link
              href="/dashboard/guide#clone-modes"
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#6B9FD4] hover:underline"
            >
              <BookOpen className="h-4 w-4" />
              모드 선택 가이드
            </Link>
          </div>
          <Image
            src="/images/dashboard/step-2-clone.svg"
            alt="클론"
            width={180}
            height={105}
            className="mx-auto rounded-lg"
          />
        </div>
      </div>

      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <ModeSelector
          mode={mode}
          options={options}
          onModeChange={(m) => {
            setMode(m);
            setOptions(MODE_PRESETS[m]);
          }}
          onOptionsChange={setOptions}
          showAdvanced={showAdvanced}
          onToggleAdvanced={() => setShowAdvanced((v) => !v)}
        />

        <form className="mt-6 space-y-4 border-t pt-6" onSubmit={onSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium">Target URL</label>
            <Input type="url" value={url} onChange={(e) => setUrl(e.target.value)} required />
          </div>
          <Button type="submit" disabled={loading} size="lg">
            <Play className="mr-1 h-4 w-4" />
            {loading ? "클로닝 중…" : "클론 실행"}
          </Button>
        </form>

        {error && (
          <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
            {error.includes("Worker") && (
              <p className="mt-2">
                <Link href="/dashboard/waiting" className="font-medium underline">
                  대기 목록에서 Worker 설정 확인 →
                </Link>
              </p>
            )}
          </div>
        )}

        {waitingHint && (
          <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
            인간 개입 또는 설정 필요:{" "}
            <Link href="/dashboard/waiting" className="font-medium underline">
              대기 목록
            </Link>
          </p>
        )}

        {loading && (
          <div className="mt-6 rounded-xl border border-dashed bg-muted/40 p-8 text-center text-sm text-muted-foreground">
            사이트를 복제하는 중입니다… 완료되면 미리보기 창이 자동으로 표시됩니다.
          </div>
        )}

        {run && run.status !== "success" && run.status !== "failed" && !loading && (
          <div className="mt-6 rounded-xl border bg-muted/30 p-4 text-sm">
            <p>
              진행 중 ·{" "}
              <Link href={`/dashboard/runs/${run.id}`} className="font-medium text-[#6B9FD4] underline">
                실행 상세 보기
              </Link>
            </p>
          </div>
        )}

        {run?.status === "success" && previewUrl && (
          <div ref={previewRef} className="mt-8">
            <ClonePreviewPanel
              previewUrl={previewUrl}
              title={result?.title ?? null}
              sourceUrl={result?.sourceUrl ?? run.url}
              description={result?.description}
              assetCount={result?.downloadedAssets.length ?? 0}
              pagesCrawled={result?.pagesCrawled}
              mode={run.mode}
              projectId={projectId}
            />
            <p className="mt-3 text-center text-xs text-muted-foreground">
              실행 기록:{" "}
              <Link href={`/dashboard/runs/${run.id}`} className="text-[#6B9FD4] underline">
                {run.id}
              </Link>
            </p>
          </div>
        )}

        {run?.mode === "agent-pixel" && run.status === "pending" && (
          <p className="mt-4 rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
            Cursor에서{" "}
            <code className="rounded bg-background px-1 font-mono">/clone-website {url}</code> 실행
          </p>
        )}
      </section>
    </div>
  );
}
