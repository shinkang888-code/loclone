"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import { QaPanel } from "@/components/qa/qa-panel";
import { ProjectTabs } from "@/components/projects/project-tabs";
import type { Project, QaReport } from "@/lib/store/types";

export default function ProjectQaPage() {
  const params = useParams();
  const pathname = usePathname();
  const id = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [qa, setQa] = useState<QaReport | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/projects/${id}`);
    const data = await res.json();
    if (data.ok) {
      setProject(data.project);
      setQa(data.qa ?? null);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (!project) return <p>불러오는 중…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{project.name} — QA</h1>
      <ProjectTabs projectId={id} pathname={pathname} />
      <QaPanel projectId={id} qa={qa} onRefresh={load} />
    </div>
  );
}
