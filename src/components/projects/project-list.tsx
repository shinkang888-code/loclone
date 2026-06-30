"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHero } from "@/components/dashboard/page-hero";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/lib/store/types";

export function ProjectList({
  projects,
  onRefresh,
}: {
  projects: Project[];
  onRefresh: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [urls, setUrls] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const targetUrls = urls
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean);
    await fetch("/api/projects", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, targetUrls, fidelity: "pixel-perfect" }),
    });
    setName("");
    setUrls("");
    setOpen(false);
    setLoading(false);
    onRefresh();
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHero
        title="프로젝트"
        description="클라이언트별 납품 단위입니다. 프로젝트를 만들고 클론 → QA → ZIP 납품까지 진행하세요."
        image="/images/dashboard/step-1-project.svg"
        actions={[
          { label: "사용 가이드", href: "/dashboard/guide", variant: "outline" },
        ]}
      />

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          총 <strong className="text-foreground">{projects.length}</strong>개 프로젝트
        </p>
        <Button onClick={() => setOpen((v) => !v)}>
          <Plus className="mr-1 h-4 w-4" />
          새 프로젝트
        </Button>
      </div>

      {open && (
        <Card className="border-indigo-200 bg-indigo-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              프로젝트 생성
            </CardTitle>
          </CardHeader>
          <form className="space-y-4 px-4 pb-4" onSubmit={onSubmit}>
            <div>
              <label className="mb-1 block text-sm font-medium">프로젝트 이름</label>
              <Input
                placeholder="예: ACME 랜딩 페이지"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Target URL (한 줄에 하나)</label>
              <textarea
                className="min-h-28 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                placeholder={"https://example.com\nhttps://example.com/about"}
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "생성 중…" : "프로젝트 생성"}
            </Button>
          </form>
        </Card>
      )}

      {projects.length === 0 ? (
        <EmptyState
          title="아직 프로젝트가 없습니다"
          description="새 프로젝트를 만들고 Target URL을 등록한 뒤 클론 탭에서 실행하세요."
          actionLabel="사용 가이드 보기"
          actionHref="/dashboard/guide"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => (
            <Link key={p.id} href={`/dashboard/projects/${p.id}`}>
              <Card className="h-full overflow-hidden transition hover:border-indigo-300 hover:shadow-md">
                <div className="border-b bg-muted/30">
                  <Image
                    src="/images/dashboard/step-1-project.svg"
                    alt=""
                    width={480}
                    height={120}
                    className="h-24 w-full object-cover opacity-80"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{p.name}</CardTitle>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Badge variant="outline">{p.status}</Badge>
                    <Badge variant="outline">{p.targetUrls.length} URLs</Badge>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
