"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
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
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">실행 기록</h1>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">URL</th>
              <th className="p-3">상태</th>
              <th className="p-3">시작</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <tr key={run.id} className="border-t">
                <td className="p-3 font-mono text-xs">{run.url}</td>
                <td className="p-3">
                  <Badge variant={run.status === "success" ? "success" : run.status === "failed" ? "destructive" : "default"}>
                    {run.status}
                  </Badge>
                </td>
                <td className="p-3 text-muted-foreground">{new Date(run.startedAt).toLocaleString()}</td>
                <td className="p-3">
                  <Link href={`/dashboard/runs/${run.id}`} className="text-primary underline">
                    상세
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
