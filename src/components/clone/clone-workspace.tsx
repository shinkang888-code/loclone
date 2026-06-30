"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeSelector } from "@/components/clone/mode-selector";
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
    <section className="w-full max-w-3xl rounded-2xl border bg-card p-6 shadow-sm md:p-8">
      <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
        Web Clone Runner
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        6가지 클론 모드 — static은 즉시, render/mirror는 Worker 필요
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
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "클로닝 중..." : "클로닝 실행"}
          </Button>
          <span className="text-xs text-muted-foreground">
            결과 저장: <code className="font-mono">docs/research/runs/*</code>
          </span>
        </div>
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

      {result ? (
        <div className="mt-6 space-y-3 rounded-lg border p-4 text-sm">
          <p>
            <span className="font-medium">Run ID:</span> {result.runId}
          </p>
          <p>
            <span className="font-medium">Title:</span> {result.title}
          </p>
          <p>
            <span className="font-medium">Final URL:</span>{" "}
            <a className="text-blue-600 underline" href={result.finalUrl} target="_blank" rel="noreferrer">
              {result.finalUrl}
            </a>
          </p>
          <p>
            <span className="font-medium">Downloaded Assets:</span> {result.downloadedAssets.length}
          </p>
          {result.pagesCrawled != null && (
            <p>
              <span className="font-medium">Pages:</span> {result.pagesCrawled}
            </p>
          )}
        </div>
      ) : null}
    </section>
  );
}
