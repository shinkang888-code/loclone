"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CloneResult } from "@/types/clone";
import type { CloneRun } from "@/lib/store/types";

export function CloneRunner({
  projectId,
  defaultUrl,
}: {
  projectId: string;
  defaultUrl?: string;
}) {
  const [url, setUrl] = useState(defaultUrl ?? "https://www.apple.com");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [run, setRun] = useState<CloneRun | null>(null);
  const [result, setResult] = useState<CloneResult | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/clone`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? "클론 실패");
      setRun(data.run);
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-xl border bg-card p-6">
      <h2 className="text-xl font-semibold">클론 실행</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        URL 추출 → HTML/메타/에셋 저장 → 실행 기록에 등록
      </p>
      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
        <Input type="url" value={url} onChange={(e) => setUrl(e.target.value)} required />
        <Button type="submit" disabled={loading}>
          {loading ? "클로닝 중…" : "클론 실행"}
        </Button>
      </form>
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      {run && (
        <div className="mt-4 space-y-2 text-sm">
          <p>Run ID: <code>{run.id}</code></p>
          <p>상태: {run.status}</p>
          {result && (
            <>
              <p>제목: {result.title}</p>
              <p>에셋: {result.downloadedAssets.length}개</p>
            </>
          )}
        </div>
      )}
    </section>
  );
}
