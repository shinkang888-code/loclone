"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandLogo } from "@/components/brand/brand-logo";
import { LCLONE_BRAND } from "@/lib/brand/tokens";
import { Button } from "@/components/ui/button";

export default function LoginClient() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/dashboard/projects";

  async function devLogin() {
    await fetch("/api/auth/dev-login", { method: "POST" });
    router.push(next);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0B1018] p-6">
      <Image
        src={LCLONE_BRAND.images.heroReplication}
        alt=""
        fill
        className="object-cover opacity-30"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B1018]/80 via-[#0B1018] to-[#0B1018]" />

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#141B26]/90 p-8 shadow-2xl backdrop-blur-md lclone-card-glow">
        <div className="mb-8 flex justify-center">
          <BrandLogo href="/" size="lg" />
        </div>
        <h1 className="text-center text-xl font-semibold text-white">워크스페이스 로그인</h1>
        <p className="mt-2 text-center text-sm text-[#8A96A8]">
          Supabase 미설정 시 개발 로그인으로 대시보드에 접속합니다.
        </p>
        <Button
          className="mt-8 w-full bg-gradient-to-r from-[#4A7DB8] to-[#6B9FD4] text-white hover:opacity-95"
          size="lg"
          onClick={() => devLogin()}
        >
          개발 로그인
        </Button>
      </div>
    </main>
  );
}
