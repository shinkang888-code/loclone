"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArtifactList, type ArtifactWithContent } from "@/components/clone/artifact-list";
import { RunLogViewer } from "@/components/clone/run-log-viewer";
import { Badge } from "@/components/ui/badge";
import type { CloneRun, CloneRunStep } from "@/lib/store/types";

export default function RunDetailPage() {
  const params = useParams();
  const runId = params.runId as string;
  const [run, setRun] = useState<CloneRun | null>(null);
  const [steps, setSteps] = useState<CloneRunStep[]>([]);
  const [artifacts, setArtifacts] = useState<ArtifactWithContent[]>([]);

  const load = useCallback(async () => {
    const [detailRes, artRes] = await Promise.all([
      fetch(`/api/runs/${runId}`),
      fetch(`/api/runs/${runId}/artifacts`),
    ]);
    const detail = await detailRes.json();
    const art = await artRes.json();
    if (detail.ok) {
      setRun(detail.run);
      setSteps(detail.steps ?? []);
    }
    if (art.ok) setArtifacts(art.artifacts);
  }, [runId]);

  useEffect(() => {
    load();
  }, [load]);

  if (!run) return <p>불러오는 중…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Run 상세</h1>
      <div className="flex flex-wrap gap-2 items-center">
        <Badge>{run.status}</Badge>
        <Badge variant="outline">{run.mode}</Badge>
        <span className="text-sm text-muted-foreground">진행 {run.progress}%</span>
        <span className="text-sm font-mono text-muted-foreground">{run.url}</span>
      </div>
      {run.error && <p className="text-destructive">{run.error}</p>}
      {run.workerJobId && (
        <p className="text-xs text-muted-foreground">Worker Job: {run.workerJobId}</p>
      )}

      <section>
        <h2 className="mb-2 font-semibold">실시간 로그</h2>
        <RunLogViewer runId={runId} />
      </section>

      <section>
        <h2 className="mb-2 font-semibold">빌드 단계</h2>
        <ul className="space-y-1 text-sm">
          {steps.map((s) => (
            <li key={s.id}>
              {s.step} — {s.status}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 font-semibold">아티팩트</h2>
        <ArtifactList artifacts={artifacts} />
      </section>
    </div>
  );
}
