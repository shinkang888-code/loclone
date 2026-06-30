"use client";

import Image from "next/image";
import Link from "next/link";
import { LandingHero } from "@/components/brand/landing-hero";
import { LCLONE_BRAND } from "@/lib/brand/tokens";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    image: LCLONE_BRAND.images.heroDashboard,
    title: "즉시 미리보기",
    body: "클론 완료 시 브라우저 프레임에서 복사본을 바로 확인합니다.",
  },
  {
    image: "/images/dashboard/mode-render.svg",
    title: "6가지 클론 모드",
    body: "정적 추출부터 JS 렌더·미러·AI 픽셀까지 목적에 맞게 선택.",
  },
  {
    image: "/images/dashboard/step-5-export.svg",
    title: "ZIP 납품 패키지",
    body: "README·HANDOFF·QA 리포트와 함께 고객에게 전달.",
  },
] as const;

export default function HomePage() {
  return (
    <main className="bg-[#0B1018] text-white">
      <LandingHero />

      <section id="features" className="mx-auto max-w-7xl px-6 py-24 md:px-10">
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">고객 납품 수준 워크플로우</h2>
          <p className="mt-4 text-[#A8B4C4]">이미지 중심 UI로 복잡한 클론 과정을 직관적으로.</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {FEATURES.map((f) => (
            <article
              key={f.title}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-[#141B26] transition hover:border-[#4A7DB8]/50 hover:shadow-lg hover:shadow-[#4A7DB8]/10"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-[#1E2836]">
                <Image
                  src={f.image}
                  alt={f.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width:768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141B26] to-transparent" />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#A8B4C4]">{f.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="workflow" className="border-t border-white/10 bg-[#141B26]/50 py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
              <Image
                src={LCLONE_BRAND.images.brandGuide}
                alt="Lclone brand identity"
                width={800}
                height={600}
                className="h-auto w-full"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Lclone 브랜드 품질</h2>
              <p className="text-[#A8B4C4] leading-relaxed">
                메탈릭 블루·차콜·실버 팔레트로 통일된 프리미엄 B2B 경험.
                대시보드 전체에 브랜드 이미지와 다크 UI를 적용했습니다.
              </p>
              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-gradient-to-r from-[#4A7DB8] to-[#6B9FD4] text-white",
                )}
              >
                대시보드 열기
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-10 text-center text-sm text-[#6B7A8C]">
        © {new Date().getFullYear()} {LCLONE_BRAND.name} · {LCLONE_BRAND.taglineKo}
      </footer>
    </main>
  );
}
