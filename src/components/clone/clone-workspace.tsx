"use client";

import { FormEvent, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeSelector } from "@/components/clone/mode-selector";
import { ClonePreviewPanel } from "@/components/clone/clone-preview-panel";
import { getClonePreviewUrlFromResult } from "@/lib/clone/preview-url";
import type { CloneResponse, CloneResult, CloneMode, CloneOptions } from "@/types/clone";
import { MODE_PRESETS } from "@/types/clone";

const EXAMPLE_URL = "https://www.apple.com";

export function CloneWorkspace() {
  const [url, setUrl] = useState(EXAMPLE_URL);
  const [mode, setMode] = useState<CloneMode>("static");
  const [options, setOptions] = useState<CloneOptions>(MODE_PRESETS.static);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CloneResult | null>(null);
  const [waitingHint, setWaitingHint] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);
    setWaitingHint(null);

    try {
      const response = await fetch("/api/clone", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url, mode, options }),
      });
      const data = (await response.json()) as CloneResponse;
      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "클로닝에 실패했습니다.");
      }
      if (data.waitingRequired) {
        setWaitingHint(data.error ?? "/dashboard/waiting");
        return;
      }
      if (!data.result) {
        throw new Error(data.error ?? "클로닝에 실패했습니다.");
      }
      setResult(data.result);
      setTimeout(() => {
        previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "요청 처리 중 오류가 발생했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="w-full max-w-3xl space-y-6">
      <div className="rounded-2xl border bg-card p-6 shadow-sm md:p-8">
        <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
          Web Clone Runner
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          클론 완료 시 아래에 사이트 복사본 미리보기가 표시됩니다.
        </p>

        <div className="mt-6">
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
        </div>

        <form className="mt-6 space-y-3" onSubmit={onSubmit}>
          <label className="block text-sm font-medium text-foreground" htmlFor="clone-url">
            Target URL
          </label>
          <input
            id="clone-url"
            type="url"
            required
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="https://example.com"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "클로닝 중..." : "클로닝 실행"}
          </Button>
        </form>

        {error ? (
          <div className="mt-6 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
            {error.includes("Worker") && (
              <p className="mt-2">
                <Link href="/dashboard/waiting" className="underline">
                  대기 목록
                </Link>
              </p>
            )}
          </div>
        ) : null}

        {waitingHint && (
          <p className="mt-4 text-sm text-amber-700">
            <Link href="/dashboard/waiting" className="underline">
              대기 목록
            </Link>{" "}
            확인
          </p>
        )}
      </div>

      {result && (
        <div ref={previewRef}>
          <ClonePreviewPanel
            previewUrl={getClonePreviewUrlFromResult(result)}
            title={result.title}
            sourceUrl={result.sourceUrl}
            description={result.description}
            assetCount={result.downloadedAssets.length}
            pagesCrawled={result.pagesCrawled}
            mode={mode}
          />
        </div>
      )}
    </section>
  );
}
