"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import Image from "next/image";
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

  if (!project) return <p className="text-muted-foreground">불러오는 중…</p>;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-4">
        <Image src="/images/dashboard/step-2-clone.svg" alt="" width={64} height={40} />
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-sm text-muted-foreground">클론 실행 · 6가지 모드</p>
        </div>
      </div>
      <ProjectTabs projectId={id} pathname={pathname} />
      <CloneRunner projectId={id} defaultUrl={project.targetUrls[0]} />
      <div className="rounded-xl border border-violet-200 bg-violet-50 p-5 text-sm">
        <p className="font-semibold text-violet-900">AI 픽셀 클론 (agent-pixel)</p>
        <p className="mt-1 text-violet-800">
          Cursor/Claude에서{" "}
          <code className="rounded bg-white px-1.5 py-0.5 font-mono">
            /clone-website {project.targetUrls[0] ?? "URL"}
          </code>{" "}
          실행
        </p>
      </div>
    </div>
  );
}
