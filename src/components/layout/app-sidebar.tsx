import Link from "next/link";
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
import { BRAND, NAV_SECTIONS } from "@/lib/dashboard/content";

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
    <aside className="flex w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="border-b px-5 py-5">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
            L
          </div>
          <div>
            <p className="text-base font-bold tracking-tight">{BRAND.name}</p>
            <p className="text-[11px] leading-tight text-muted-foreground">{BRAND.tagline}</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto p-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
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
                      "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-indigo-600 text-white shadow-sm"
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

      <div className="border-t p-4">
        <Link
          href="/dashboard/guide"
          className="block rounded-lg bg-indigo-50 p-3 text-xs leading-relaxed text-indigo-900 transition hover:bg-indigo-100"
        >
          <p className="font-semibold">처음이신가요?</p>
          <p className="mt-1 text-indigo-700/80">5단계 사용 가이드 보기 →</p>
        </Link>
      </div>
    </aside>
  );
}
