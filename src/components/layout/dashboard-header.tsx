"use client";

import { Button } from "@/components/ui/button";

export function DashboardHeader({
  email,
}: {
  email?: string;
}) {
  async function logout() {
    await fetch("/api/auth/session", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <header className="flex h-14 items-center justify-between border-b px-6">
      <p className="text-sm text-muted-foreground">
        {email ? `${email}` : "개발 모드"}
      </p>
      <Button variant="outline" size="sm" onClick={() => logout()}>
        로그아웃
      </Button>
    </header>
  );
}
