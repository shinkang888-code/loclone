import Link from "next/link";
import Image from "next/image";
import {
  Activity,
  BookOpen,
  ClipboardList,
  FolderKanban,
  Globe,
  Home,
  Settings,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/brand/brand-logo";
import { LCLONE_BRAND } from "@/lib/brand/tokens";
import { NAV_SECTIONS } from "@/lib/dashboard/content";

const ICONS = {
  home: Home,
  book: BookOpen,
  folder: FolderKanban,
  activity: Activity,
  globe: Globe,
  clipboard: ClipboardList,
  settings: Settings,
  shield: Shield,
} as const;

export function AppSidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="relative flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="absolute inset-0 opacity-30">
        <Image
          src={LCLONE_BRAND.images.heroReplication}
          alt=""
          fill
          className="object-cover object-left-top"
          sizes="256px"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-sidebar via-sidebar/95 to-sidebar" />
      </div>

      <div className="relative border-b border-sidebar-border px-4 py-5">
        <BrandLogo href="/dashboard" size="md" />
      </div>

      <nav className="relative flex-1 space-y-6 overflow-y-auto p-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {section.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {section.items.map(({ href, label, icon }) => {
                const Icon = ICONS[icon];
                const active =
                  href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname === href ||
                      (href !== "/dashboard/projects" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                      active
                        ? "bg-gradient-to-r from-[#4A7DB8] to-[#3D6B9A] text-white shadow-md shadow-[#4A7DB8]/20"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="relative border-t border-sidebar-border p-4">
        <Link
          href="/dashboard/guide"
          className="block overflow-hidden rounded-xl border border-[#4A7DB8]/30 bg-[#1E2836]/80 p-3 transition hover:border-[#4A7DB8]/60"
        >
          <p className="text-xs font-semibold text-[#A8D4FF]">처음이신가요?</p>
          <p className="mt-1 text-[11px] text-muted-foreground">5단계 사용 가이드 →</p>
        </Link>
      </div>
    </aside>
  );
}
