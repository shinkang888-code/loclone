"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import Image from "next/image";
import { PreviewCompare } from "@/components/clone/preview-compare";
import { ProjectTabs } from "@/components/projects/project-tabs";
import { SectionHeading } from "@/components/dashboard/section-heading";
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

  if (!project) return <p className="text-muted-foreground">불러오는 중…</p>;

  const sourceUrl = latestRun?.url ?? project.targetUrls[0] ?? "https://example.com";
  const clonePath = latestRun?.runId
    ? latestRun.artifactDir ?? `/api/clones/${latestRun.runId}`
    : null;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center gap-4">
        <Image src="/images/dashboard/step-3-preview.svg" alt="" width={80} height={48} />
        <SectionHeading title={project.name} description="원본 vs 클론 프리뷰 비교" />
      </div>
      <ProjectTabs projectId={id} pathname={pathname} />
      <PreviewCompare sourceUrl={sourceUrl} clonePath={clonePath} />
    </div>
  );
}
