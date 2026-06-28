"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProjectTabs } from "@/components/projects/project-tabs";
import type { CloneRun, Project, QaReport } from "@/lib/store/types";

export default function ProjectDetailPage() {
  const params = useParams();
  const pathname = usePathname();
  const id = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [runs, setRuns] = useState<CloneRun[]>([]);
  const [qa, setQa] = useState<QaReport | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/projects/${id}`);
    const data = await res.json();
    if (data.ok) {
      setProject(data.project);
      setRuns(data.runs ?? []);
      setQa(data.qa ?? null);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (!project) return <p>불러오는 중…</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-sm text-muted-foreground">{project.description}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/api/projects/${id}/export`}>
            <Button variant="outline" size="sm">ZIP보내기</Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await fetch(`/api/projects/${id}/deploy`, { method: "POST" });
              load();
            }}
          >
            배포 요청
          </Button>
        </div>
      </div>

      <ProjectTabs projectId={id} pathname={pathname} />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">상태</p>
          <p className="font-semibold">{project.status}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Target URLs</p>
          <p className="font-semibold">{project.targetUrls.length}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">실행 수</p>
          <p className="font-semibold">{runs.length}</p>
        </div>
      </div>

      {qa && (
        <div className="rounded-lg border p-4 text-sm">
          최근 QA — SEO {qa.seoScore} / Perf {qa.perfScore} / A11y {qa.a11yScore}
        </div>
      )}

      <ul className="space-y-2 text-sm">
        {project.targetUrls.map((url) => (
          <li key={url} className="font-mono text-muted-foreground">{url}</li>
        ))}
      </ul>
    </div>
  );
}
