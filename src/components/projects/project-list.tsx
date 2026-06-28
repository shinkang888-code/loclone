"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">프로젝트</h1>
        <Button onClick={() => setOpen((v) => !v)}>새 프로젝트</Button>
      </div>

      {open && (
        <Card>
          <CardHeader>
            <CardTitle>프로젝트 생성</CardTitle>
          </CardHeader>
          <form className="space-y-3" onSubmit={onSubmit}>
            <Input placeholder="프로젝트 이름" value={name} onChange={(e) => setName(e.target.value)} required />
            <textarea
              className="min-h-24 w-full rounded-md border px-3 py-2 text-sm"
              placeholder="Target URLs (줄 단위)"
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
            />
            <Button type="submit" disabled={loading}>{loading ? "생성 중…" : "생성"}</Button>
          </form>
        </Card>
      )}

      {projects.length === 0 ? (
        <p className="text-muted-foreground">프로젝트가 없습니다. 새 프로젝트를 만드세요.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((p) => (
            <Link key={p.id} href={`/dashboard/projects/${p.id}`}>
              <Card className="transition hover:border-primary/40">
                <CardHeader>
                  <CardTitle>{p.name}</CardTitle>
                </CardHeader>
                <p className="text-sm text-muted-foreground">{p.targetUrls.length} URLs · {p.status}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
