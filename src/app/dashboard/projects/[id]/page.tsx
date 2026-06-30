"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Download, Rocket, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectTabs } from "@/components/projects/project-tabs";
import { StatCard } from "@/components/dashboard/stat-card";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { Badge } from "@/components/ui/badge";
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

  if (!project) return <p className="text-muted-foreground">불러오는 중…</p>;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="overflow-hidden rounded-2xl border bg-gradient-to-r from-indigo-50 to-violet-50">
        <div className="grid gap-6 p-6 md:grid-cols-[1fr_200px] md:items-center">
          <div>
            <Badge className="mb-2">{project.status}</Badge>
            <h1 className="text-2xl font-bold md:text-3xl">{project.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {project.description ?? "프로젝트 설명 없음"}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={`/api/projects/${id}/export`}>
                <Button variant="default" size="sm">
                  <Download className="mr-1 h-4 w-4" />
                  ZIP 납품
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await fetch(`/api/projects/${id}/deploy`, { method: "POST" });
                  load();
                }}
              >
                <Rocket className="mr-1 h-4 w-4" />
                배포 요청
              </Button>
              <Link href={`/dashboard/projects/${id}/clone`}>
                <Button variant="outline" size="sm">
                  클론 실행 →
                </Button>
              </Link>
            </div>
          </div>
          <Image
            src="/images/dashboard/step-2-clone.svg"
            alt=""
            width={200}
            height={120}
            className="hidden rounded-lg md:block"
          />
        </div>
      </div>

      <ProjectTabs projectId={id} pathname={pathname} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="상태" value={project.status} />
        <StatCard label="Target URLs" value={project.targetUrls.length} icon={Link2} />
        <StatCard label="클론 실행" value={runs.length} hint="누적 Run" />
      </div>

      {qa && (
        <div className="rounded-xl border bg-card p-5">
          <SectionHeading title="최근 QA 요약" />
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["SEO", qa.seoScore],
              ["성능", qa.perfScore],
              ["접근성", qa.a11yScore],
              ["디자인", qa.designScore ?? "—"],
            ].map(([label, score]) => (
              <div key={label as string} className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold">{score}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <section>
        <SectionHeading title="Target URLs" description="클론 대상 주소 목록" />
        <ul className="mt-4 space-y-2">
          {project.targetUrls.map((url) => (
            <li
              key={url}
              className="rounded-lg border bg-muted/20 px-4 py-3 font-mono text-xs text-muted-foreground"
            >
              {url}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
