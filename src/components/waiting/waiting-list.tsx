"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">인간 선택 대기 목록</h1>
          <p className="text-sm text-muted-foreground">
            자동화로 처리할 수 없는 설정·배포·자격증명은 여기에 쌓입니다.
          </p>
        </div>
        <Button variant="outline" onClick={() => scan()}>환경 스캔</Button>
      </div>

      {pending.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">
          대기 중인 항목이 없습니다.
        </Card>
      ) : (
        <div className="space-y-3">
          {pending.map((item) => (
            <Card key={item.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="warning">{item.category}</Badge>
                    <h3 className="font-semibold">{item.title}</h3>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                  {item.envKeys && (
                    <p className="mt-1 text-xs font-mono">
                      {item.envKeys.join(", ")}
                    </p>
                  )}
                  {item.actionUrl && (
                    <a
                      href={item.actionUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 text-sm text-primary underline"
                    >
                      설정 페이지 열기
                    </a>
                  )}
                </div>
                <Button size="sm" variant="outline" onClick={() => markDone(item.id)}>
                  완료 처리
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
