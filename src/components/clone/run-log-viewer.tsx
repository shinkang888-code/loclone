"use client";

import { useEffect, useState } from "react";

interface LogLine {
  ts: string;
  level: string;
  message: string;
}

export function RunLogViewer({ runId }: { runId: string }) {
  const [logs, setLogs] = useState<LogLine[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/runs/${runId}/logs`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && d.ok) setLogs(d.logs ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, [runId]);

  if (logs.length === 0) {
    return <p className="text-sm text-muted-foreground">로그 없음</p>;
  }

  return (
    <pre className="max-h-64 overflow-auto rounded-md border bg-muted/40 p-3 text-xs font-mono">
      {logs.map((l, i) => (
        <div key={`${l.ts}-${i}`} className={l.level === "error" ? "text-destructive" : ""}>
          [{l.ts}] {l.message}
        </div>
      ))}
    </pre>
  );
}
