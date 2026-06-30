import { PageHero } from "@/components/dashboard/page-hero";
import { StepGuideCard } from "@/components/dashboard/step-guide-card";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { ModeGuideGrid } from "@/components/dashboard/mode-guide-grid";
import {
  BRAND,
  CLONE_MODE_GUIDE,
  FAQ_ITEMS,
  WORKFLOW_STEPS,
} from "@/lib/dashboard/content";

export default function GuidePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-12 pb-12">
      <PageHero
        title="Loclone 사용 가이드"
        description="처음 사용하는 분도 이 문서만 따라하면 프로젝트 생성부터 ZIP 납품까지 완료할 수 있습니다."
        image="/images/dashboard/hero-dashboard.svg"
        actions={[
          { label: "프로젝트 만들기", href: "/dashboard/projects" },
          { label: "대기 목록", href: "/dashboard/waiting", variant: "outline" },
        ]}
      />

      <section className="space-y-6">
        <SectionHeading
          title="전체 흐름 (5단계)"
          description="각 단계별 스크린샷과 체크리스트입니다."
        />
        {WORKFLOW_STEPS.map((step, i) => (
          <StepGuideCard key={step.step} {...step} reverse={i % 2 === 1} />
        ))}
      </section>

      <section id="clone-modes" className="space-y-6 scroll-mt-8">
        <SectionHeading title="클론 모드 선택 가이드" />
        <ModeGuideGrid modes={CLONE_MODE_GUIDE} />
      </section>

      <section id="export" className="scroll-mt-8 space-y-4">
        <SectionHeading title="ZIP 납품" description={BRAND.tagline} />
      </section>

      <section className="space-y-4">
        <SectionHeading title="자주 묻는 질문" />
        <div className="space-y-3">
          {FAQ_ITEMS.map((item) => (
            <details key={item.q} className="rounded-xl border bg-card">
              <summary className="cursor-pointer px-5 py-4 font-medium">{item.q}</summary>
              <p className="border-t px-5 py-4 text-sm text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
