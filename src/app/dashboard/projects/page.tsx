"use client";

import { useCallback, useEffect, useState } from "react";
import { ProjectList } from "@/components/projects/project-list";
import type { Project } from "@/lib/store/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);

  const load = useCallback(async () => {
    const res = await fetch("/api/projects");
    const data = await res.json();
    if (data.ok) setProjects(data.projects);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return <ProjectList projects={projects} onRefresh={load} />;
}
