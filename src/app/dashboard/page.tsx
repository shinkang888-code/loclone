"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  FolderKanban,
  Globe,
  Package,
} from "lucide-react";
import { PageHero } from "@/components/dashboard/page-hero";
import { StatCard } from "@/components/dashboard/stat-card";
import { StepGuideCard } from "@/components/dashboard/step-guide-card";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { BRAND, WORKFLOW_STEPS } from "@/lib/dashboard/content";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function DashboardHomePage() {
  const [stats, setStats] = useState({
    projects: 0,
    runs: 0,
    waiting: 0,
    sites: 0,
  });

  const load = useCallback(async () => {
    const [healthRes, waitingRes] = await Promise.all([
      fetch("/api/health").then((r) => r.json()),
      fetch("/api/waiting").then((r) => r.json()),
    ]);
    if (healthRes.ok) {
      setStats((s) => ({
        ...s,
        projects: healthRes.projects ?? 0,
        runs: healthRes.runs ?? 0,
      }));
    }
    if (waitingRes.ok) {
      const pending = waitingRes.items.filter(
        (w: { status: string }) => w.status === "pending",
      ).length;
      setStats((s) => ({ ...s, waiting: pending }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <PageHero
        title="고객 납품용 웹 클론 워크스페이스"
        description={BRAND.description}
        image="/images/dashboard/hero-dashboard.svg"
        imageAlt="Loclone 대시보드"
        actions={[
          { label: "프로젝트 시작", href: "/dashboard/projects" },
          { label: "사용 가이드", href: "/dashboard/guide", variant: "outline" },
        ]}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="프로젝트" value={stats.projects} icon={FolderKanban} hint="진행 중인 납품" />
        <StatCard label="클론 실행" value={stats.runs} icon={Activity} hint="누적 Run" />
        <StatCard
          label="대기 항목"
          value={stats.waiting}
          icon={AlertCircle}
          hint="설정·인간 개입"
          trend={stats.waiting > 0 ? "down" : "up"}
        />
        <StatCard label="모니터 사이트" value={stats.sites} icon={Globe} hint="납품 후 점검" />
      </section>

      <section className="space-y-6">
        <SectionHeading
          title="5단계 납품 워크플로우"
          description="프로젝트 생성부터 ZIP 납품까지. 각 단계를 클릭하면 상세 가이드로 이동합니다."
        />
        <div className="space-y-4">
          {WORKFLOW_STEPS.map((step, i) => (
            <StepGuideCard key={step.step} {...step} reverse={i % 2 === 1} />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border bg-gradient-to-r from-slate-50 to-indigo-50 p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold">납품 ZIP에 포함되는 항목</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              README · HANDOFF.md · QA 리포트 · clones/ · research/
            </p>
          </div>
          <Link
            href="/dashboard/guide#export"
            className={cn(buttonVariants({ size: "lg" }), "inline-flex items-center gap-2")}
          >
            <Package className="h-4 w-4" />
            납품 가이드 보기
          </Link>
        </div>
      </section>
    </div>
  );
}
