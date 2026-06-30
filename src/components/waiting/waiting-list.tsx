"use client";

import Image from "next/image";
import Link from "next/link";
import { Scan, ExternalLink, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHero } from "@/components/dashboard/page-hero";
import { EmptyState } from "@/components/dashboard/empty-state";
import type { WaitingItem } from "@/lib/store/types";

export function WaitingList({
  items,
  onRefresh,
}: {
  items: WaitingItem[];
  onRefresh: () => void;
}) {
  async function scan() {
    await fetch("/api/waiting", { method: "POST" });
    onRefresh();
  }

  async function markDone(id: string) {
    await fetch("/api/waiting", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
    onRefresh();
  }

  const pending = items.filter((i) => i.status === "pending");

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHero
        title="대기 목록"
        description="자동화로 처리할 수 없는 설정·Worker·MCP·배포 토큰은 여기에 표시됩니다. 해결 후 완료 처리하세요."
        image="/images/dashboard/step-5-export.svg"
        actions={[{ label: "설정 가이드", href: "/dashboard/settings", variant: "outline" }]}
      />

      <div className="flex justify-end">
        <Button variant="outline" onClick={() => scan()}>
          <Scan className="mr-1 h-4 w-4" />
          환경 스캔
        </Button>
      </div>

      {pending.length === 0 ? (
        <EmptyState
          title="대기 중인 항목이 없습니다"
          description="모든 필수 설정이 완료되었습니다. 클론을 진행하세요."
          actionLabel="클론 가이드"
          actionHref="/dashboard/guide#clone-modes"
        />
      ) : (
        <div className="space-y-4">
          {pending.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="flex flex-col gap-4 p-5 md:flex-row md:items-start md:justify-between">
                <div className="flex gap-4">
                  <div className="hidden shrink-0 sm:block">
                    <Image
                      src="/images/dashboard/mode-agent.svg"
                      alt=""
                      width={80}
                      height={54}
                      className="rounded-lg border"
                    />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="warning">{item.category}</Badge>
                      <h3 className="font-semibold">{item.title}</h3>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                    {item.envKeys && (
                      <p className="mt-2 rounded bg-muted px-2 py-1 font-mono text-xs">
                        {item.envKeys.join(", ")}
                      </p>
                    )}
                    {item.actionUrl && (
                      <a
                        href={item.actionUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        설정 페이지 열기
                      </a>
                    )}
                  </div>
                </div>
                <Button size="sm" onClick={() => markDone(item.id)}>
                  <CheckCircle2 className="mr-1 h-4 w-4" />
                  완료 처리
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Worker 설정 방법은{" "}
        <Link href="/dashboard/guide#clone-modes" className="text-indigo-600 underline">
          사용 가이드
        </Link>
        를 참고하세요.
      </p>
    </div>
  );
}
