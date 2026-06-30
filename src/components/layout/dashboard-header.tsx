"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const LABELS: Record<string, string> = {
  dashboard: "홈",
  guide: "사용 가이드",
  projects: "프로젝트",
  runs: "실행 기록",
  sites: "사이트 모니터",
  waiting: "대기 목록",
  settings: "설정",
  admin: "Admin",
  clone: "클론",
  preview: "프리뷰",
  qa: "QA",
};

function breadcrumbs(pathname: string): Array<{ href: string; label: string }> {
  const parts = pathname.split("/").filter(Boolean);
  const crumbs: Array<{ href: string; label: string }> = [];
  let href = "";
  for (const part of parts) {
    href += `/${part}`;
    crumbs.push({ href, label: LABELS[part] ?? part });
  }
  return crumbs;
}

export function DashboardHeader({ email }: { email?: string }) {
  const pathname = usePathname();
  const crumbs = breadcrumbs(pathname);

  async function logout() {
    await fetch("/api/auth/session", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/95 px-6 backdrop-blur">
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        {crumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5" />}
            {i === crumbs.length - 1 ? (
              <span className="font-medium text-foreground">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="hover:text-foreground">
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        <span className="hidden text-xs text-muted-foreground sm:inline">
          {email ?? "개발 모드"}
        </span>
        <Button variant="outline" size="sm" onClick={() => logout()}>
          로그아웃
        </Button>
      </div>
    </header>
  );
}
