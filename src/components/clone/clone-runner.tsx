"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModeSelector } from "@/components/clone/mode-selector";
import { SectionHeading } from "@/components/dashboard/section-heading";
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

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setWaitingHint(null);
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
      <div className="overflow-hidden rounded-2xl border bg-gradient-to-br from-emerald-50 to-indigo-50">
        <div className="grid gap-4 p-6 md:grid-cols-[1fr_180px] md:items-center">
          <div>
            <SectionHeading
              title="클론 실행"
              description="① 모드 선택 → ② URL 입력 → ③ 실행. mirror/render는 Clone Worker 필요."
            />
            <Link
              href="/dashboard/guide#clone-modes"
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline"
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

        {run && (
          <div className="mt-6 space-y-2 rounded-xl border bg-muted/30 p-4 text-sm">
            <p>
              Run:{" "}
              <Link href={`/dashboard/runs/${run.id}`} className="font-mono font-medium text-indigo-600 underline">
                {run.id}
              </Link>
            </p>
            <p>
              모드: <strong>{run.mode}</strong> · 상태: <strong>{run.status}</strong> · 진행:{" "}
              {run.progress}%
            </p>
            {result && (
              <>
                <p>제목: {result.title}</p>
                <p>에셋: {result.downloadedAssets.length}개</p>
                {result.pagesCrawled != null && <p>페이지: {result.pagesCrawled}개</p>}
              </>
            )}
            {run.mode === "agent-pixel" && run.status === "pending" && (
              <p className="text-muted-foreground">
                Cursor에서 <code className="rounded bg-background px-1 font-mono">/clone-website {url}</code> 실행
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
