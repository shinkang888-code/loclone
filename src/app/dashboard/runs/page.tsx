"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PageHero } from "@/components/dashboard/page-hero";
import { EmptyState } from "@/components/dashboard/empty-state";
import type { CloneRun } from "@/lib/store/types";

export default function RunsPage() {
  const [runs, setRuns] = useState<CloneRun[]>([]);

  const load = useCallback(async () => {
    const res = await fetch("/api/runs");
    const data = await res.json();
    if (data.ok) setRuns(data.runs);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHero
        title="실행 기록"
        description="모든 클론 Run의 상태·모드·진행률을 확인합니다. 상세에서 실시간 로그와 아티팩트를 볼 수 있습니다."
        image="/images/dashboard/step-2-clone.svg"
      />

      {runs.length === 0 ? (
        <EmptyState
          title="실행 기록이 없습니다"
          description="프로젝트 → 클론 탭에서 첫 클론을 실행하세요."
          actionLabel="프로젝트로 이동"
          actionHref="/dashboard/projects"
        />
      ) : (
        <div className="overflow-hidden rounded-xl border shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-indigo-50/80 text-left">
              <tr>
                <th className="p-4 font-semibold">URL</th>
                <th className="p-4 font-semibold">모드</th>
                <th className="p-4 font-semibold">상태</th>
                <th className="p-4 font-semibold">진행</th>
                <th className="p-4 font-semibold">시작</th>
                <th className="p-4" />
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr key={run.id} className="border-t transition hover:bg-muted/30">
                  <td className="max-w-xs truncate p-4 font-mono text-xs">{run.url}</td>
                  <td className="p-4">
                    <Badge variant="outline">{run.mode ?? "static"}</Badge>
                  </td>
                  <td className="p-4">
                    <Badge
                      variant={
                        run.status === "success"
                          ? "success"
                          : run.status === "failed"
                            ? "destructive"
                            : "default"
                      }
                    >
                      {run.status}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-indigo-600"
                          style={{ width: `${run.progress ?? 0}%` }}
                        />
                      </div>
                      <span className="text-xs">{run.progress ?? 0}%</span>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {new Date(run.startedAt).toLocaleString("ko-KR")}
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/dashboard/runs/${run.id}`}
                      className="font-medium text-indigo-600 hover:underline"
                    >
                      상세 →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
