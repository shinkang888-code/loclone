"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import { CloneRunner } from "@/components/clone/clone-runner";
import { ProjectTabs } from "@/components/projects/project-tabs";
import type { Project } from "@/lib/store/types";

export default function ProjectClonePage() {
  const params = useParams();
  const pathname = usePathname();
  const id = params.id as string;
  const [project, setProject] = useState<Project | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/projects/${id}`);
    const data = await res.json();
    if (data.ok) setProject(data.project);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (!project) return <p>불러오는 중…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{project.name} — 클론</h1>
      <ProjectTabs projectId={id} pathname={pathname} />
      <CloneRunner projectId={id} defaultUrl={project.targetUrls[0]} />
      <div className="rounded-lg border bg-muted/40 p-4 text-sm">
        <p className="font-medium">에이전트 빌드 (수동)</p>
        <p className="mt-1 text-muted-foreground">
          Cursor/Claude에서 <code className="font-mono">/clone-website {project.targetUrls[0] ?? "URL"}</code> 실행
        </p>
      </div>
    </div>
  );
}
