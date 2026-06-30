import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  trend,
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-card p-5 lclone-card-glow transition hover:border-[#4A7DB8]/40",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        {Icon && (
          <div className="rounded-lg bg-gradient-to-br from-[#4A7DB8]/20 to-[#1E2836] p-2.5 text-[#6B9FD4] ring-1 ring-[#4A7DB8]/20">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {trend && (
        <p
          className={cn(
            "mt-3 text-xs font-medium",
            trend === "up" && "text-emerald-400",
            trend === "down" && "text-red-400",
            trend === "neutral" && "text-muted-foreground",
          )}
        >
          {trend === "up" && "↑ 정상"}
          {trend === "down" && "↓ 확인 필요"}
          {trend === "neutral" && "—"}
        </p>
      )}
    </div>
  );
}
