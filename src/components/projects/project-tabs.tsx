"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "", label: "개요" },
  { href: "/clone", label: "클론" },
  { href: "/preview", label: "프리뷰" },
  { href: "/qa", label: "QA" },
] as const;

export function ProjectTabs({
  projectId,
  pathname,
}: {
  projectId: string;
  pathname: string;
}) {
  const base = `/dashboard/projects/${projectId}`;
  return (
    <nav className="flex flex-wrap gap-2 border-b pb-3">
      {TABS.map((tab) => {
        const href = `${base}${tab.href}`;
        const active =
          tab.href === ""
            ? pathname === base || pathname === `${base}/`
            : pathname.startsWith(href);
        return (
          <Link
            key={tab.href}
            href={href}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium",
              active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
