"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginClient() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/dashboard/projects";

  async function devLogin() {
    await fetch("/api/auth/dev-login", { method: "POST" });
    router.push(next);
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Loclone 로그인</CardTitle>
        </CardHeader>
        <p className="mb-4 text-sm text-muted-foreground">
          Supabase 미설정 시 개발 로그인으로 대시보드에 접속합니다.
        </p>
        <Button onClick={() => devLogin()}>개발 로그인</Button>
      </Card>
    </main>
  );
}
