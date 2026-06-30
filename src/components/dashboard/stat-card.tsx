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
        "rounded-xl border bg-card p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        {Icon && (
          <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {trend && (
        <p
          className={cn(
            "mt-3 text-xs font-medium",
            trend === "up" && "text-emerald-600",
            trend === "down" && "text-red-600",
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
