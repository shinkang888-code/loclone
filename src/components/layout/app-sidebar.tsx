import Link from "next/link";
import {
  Activity,
  ClipboardList,
  FolderKanban,
  Globe,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard/projects", label: "프로젝트", icon: FolderKanban },
  { href: "/dashboard/runs", label: "실행 기록", icon: Activity },
  { href: "/dashboard/sites", label: "사이트 모니터", icon: Globe },
  { href: "/dashboard/waiting", label: "대기 목록", icon: ClipboardList },
  { href: "/dashboard/settings", label: "설정", icon: Settings },
  { href: "/dashboard/admin", label: "Admin", icon: LayoutDashboard },
] as const;

export function AppSidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="border-b px-4 py-4">
        <Link href="/dashboard" className="text-lg font-bold tracking-tight">
          Loclone
        </Link>
        <p className="text-xs text-muted-foreground">웹사이트 클론 플랫폼</p>
      </div>
      <nav className="flex flex-col gap-1 p-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || (href !== "/dashboard/projects" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
