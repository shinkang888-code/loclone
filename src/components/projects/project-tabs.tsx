"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Copy,
  Eye,
  LayoutGrid,
} from "lucide-react";

const TABS = [
  { href: "", label: "개요", icon: LayoutGrid },
  { href: "/clone", label: "클론", icon: Copy },
  { href: "/preview", label: "프리뷰", icon: Eye },
  { href: "/qa", label: "QA", icon: BarChart3 },
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
    <nav className="flex flex-wrap gap-2 rounded-xl border bg-muted/30 p-1.5">
      {TABS.map((tab) => {
        const href = `${base}${tab.href}`;
        const Icon = tab.icon;
        const active =
          tab.href === ""
            ? pathname === base || pathname === `${base}/`
            : pathname.startsWith(href);
        return (
          <Link
            key={tab.href}
            href={href}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-muted-foreground hover:bg-background hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
