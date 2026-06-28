"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import { PreviewCompare } from "@/components/clone/preview-compare";
import { ProjectTabs } from "@/components/projects/project-tabs";
import type { CloneRun, Project } from "@/lib/store/types";

export default function ProjectPreviewPage() {
  const params = useParams();
  const pathname = usePathname();
  const id = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [latestRun, setLatestRun] = useState<CloneRun | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/projects/${id}`);
    const data = await res.json();
    if (data.ok) {
      setProject(data.project);
      const runs = (data.runs as CloneRun[]).filter((r) => r.status === "success");
      setLatestRun(runs[0] ?? null);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (!project) return <p>불러오는 중…</p>;

  const sourceUrl = latestRun?.url ?? project.targetUrls[0] ?? "https://example.com";
  const clonePath = latestRun?.runId ? `/clones/${latestRun.runId}/assets/` : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{project.name} — 프리뷰</h1>
      <ProjectTabs projectId={id} pathname={pathname} />
      <PreviewCompare sourceUrl={sourceUrl} clonePath={clonePath} />
    </div>
  );
}
