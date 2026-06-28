"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { QaReport } from "@/lib/store/types";

export function QaPanel({
  projectId,
  qa,
  onRefresh,
}: {
  projectId: string;
  qa: QaReport | null;
  onRefresh: () => void;
}) {
  async function runQa() {
    await fetch(`/api/projects/${projectId}/qa`, { method: "POST" });
    onRefresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">납품 QA</h2>
        <Button onClick={() => runQa()}>QA 실행</Button>
      </div>
      {!qa ? (
        <p className="text-muted-foreground">QA 리포트가 없습니다.</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card><p className="text-sm text-muted-foreground">SEO</p><p className="text-2xl font-bold">{qa.seoScore}</p></Card>
            <Card><p className="text-sm text-muted-foreground">성능</p><p className="text-2xl font-bold">{qa.perfScore}</p></Card>
            <Card><p className="text-sm text-muted-foreground">접근성</p><p className="text-2xl font-bold">{qa.a11yScore}</p></Card>
          </div>
          <div className="space-y-2">
            {qa.issues.map((issue, i) => (
              <Card key={i}>
                <div className="flex items-center gap-2">
                  <Badge variant={issue.severity === "high" ? "destructive" : "warning"}>
                    {issue.severity}
                  </Badge>
                  <span className="text-sm font-medium">{issue.category}</span>
                </div>
                <p className="mt-1 text-sm">{issue.message}</p>
                {issue.fix && <p className="mt-1 text-xs text-muted-foreground">{issue.fix}</p>}
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
