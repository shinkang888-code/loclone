"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LCLONE_BRAND } from "@/lib/brand/tokens";
import { BrandLogo } from "@/components/brand/brand-logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LandingHero() {
  return (
    <section className="relative min-h-[92vh] overflow-hidden bg-[#0B1018] text-white">
      <Image
        src={LCLONE_BRAND.images.heroReplication}
        alt=""
        fill
        priority
        className="object-cover opacity-60"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0B1018] via-[#0B1018]/85 to-[#0B1018]/40" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,rgba(77,163,255,0.18),transparent_55%)]" />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-10">
        <BrandLogo href="/" size="md" />
        <nav className="hidden items-center gap-8 text-sm text-[#A8B4C4] md:flex">
          <Link href="#features" className="hover:text-white">
            Features
          </Link>
          <Link href="#workflow" className="hover:text-white">
            Workflow
          </Link>
          <Link href="/dashboard/guide" className="hover:text-white">
            Guide
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "border-white/20 bg-white/5 text-white hover:bg-white/10",
            )}
          >
            Log In
          </Link>
          <Link
            href="/dashboard"
            className={cn(
              buttonVariants({ size: "sm" }),
              "border-0 bg-gradient-to-r from-[#4A7DB8] to-[#6B9FD4] text-white shadow-lg shadow-[#4A7DB8]/30 hover:opacity-95",
            )}
          >
            Get Started
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-10 md:px-10 lg:grid-cols-2 lg:items-center lg:pt-16">
        <div className="space-y-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#4A7DB8]/40 bg-[#4A7DB8]/10 px-4 py-1.5 text-xs font-medium tracking-wide text-[#A8D4FF]">
            Premium Digital Replication
          </p>
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl lg:text-6xl">
            Innovating
            <br />
            <span className="bg-gradient-to-r from-[#7EB8E8] via-[#4DA3FF] to-[#6B9FD4] bg-clip-text text-transparent">
              Digital Replication
            </span>
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-[#A8B4C4]">
            {LCLONE_BRAND.description}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/dashboard/projects"
              className={cn(
                buttonVariants({ size: "lg" }),
                "gap-2 bg-gradient-to-r from-[#4A7DB8] to-[#5A8FC4] px-8 text-white shadow-xl shadow-[#4A7DB8]/25 hover:opacity-95",
              )}
            >
              프로젝트 시작
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard/guide"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "border-white/20 bg-white/5 text-white hover:bg-white/10",
              )}
            >
              사용 가이드
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#141B26]/80 shadow-2xl shadow-black/50 backdrop-blur-sm">
            <Image
              src={LCLONE_BRAND.images.heroDashboard}
              alt="Lclone digital interface"
              width={720}
              height={405}
              className="h-auto w-full"
              priority
            />
          </div>
          <div className="absolute -bottom-6 -left-6 hidden w-48 overflow-hidden rounded-xl border border-white/10 shadow-xl md:block">
            <Image
              src={LCLONE_BRAND.images.logoMarkPng}
              alt="Lclone logo"
              width={192}
              height={192}
              className="h-auto w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
