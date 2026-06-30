"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/dashboard/section-heading";
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-gradient-to-r from-violet-50 to-indigo-50 p-5">
        <div className="flex items-center gap-4">
          <Image src="/images/dashboard/step-4-qa.svg" alt="" width={72} height={44} />
          <SectionHeading
            title="납품 QA"
            description="SEO · 성능 · 접근성 · 디자인 토큰 자동 검수"
          />
        </div>
        <Button onClick={() => runQa()} size="lg">
          QA 실행
        </Button>
      </div>

      {!qa ? (
        <Card className="p-12 text-center text-muted-foreground">
          QA 리포트가 없습니다. 위 버튼으로 첫 검수를 실행하세요.
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["SEO", qa.seoScore],
              ["성능", qa.perfScore],
              ["접근성", qa.a11yScore],
              ["디자인", qa.designScore ?? 0],
            ].map(([label, score]) => (
              <Card key={label as string} className="p-5 text-center">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-1 text-4xl font-bold text-indigo-600">{score}</p>
              </Card>
            ))}
          </div>
          {qa.techStack && qa.techStack.length > 0 && (
            <p className="text-sm">
              <span className="font-medium">Tech stack: </span>
              {qa.techStack.join(" · ")}
            </p>
          )}
          {qa.designTokens && qa.designTokens.length > 0 && (
            <div className="rounded-lg border bg-muted/30 p-4 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Design tokens: </span>
              {qa.designTokens.slice(0, 8).join(", ")}
            </div>
          )}
          <div className="space-y-3">
            {qa.issues.map((issue, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center gap-2">
                  <Badge variant={issue.severity === "high" ? "destructive" : "warning"}>
                    {issue.severity}
                  </Badge>
                  <span className="text-sm font-medium">{issue.category}</span>
                </div>
                <p className="mt-2 text-sm">{issue.message}</p>
                {issue.fix && (
                  <p className="mt-2 rounded bg-indigo-50 px-3 py-2 text-xs text-indigo-900">
                    💡 {issue.fix}
                  </p>
                )}
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
