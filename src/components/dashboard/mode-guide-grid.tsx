import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function ModeGuideGrid({
  modes,
  className,
}: {
  modes: ReadonlyArray<{
    id: string;
    label: string;
    badge: string;
    image: string;
    when: string;
    how: string;
  }>;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {modes.map((mode) => (
        <article
          key={mode.id}
          id={`mode-${mode.id}`}
          className="overflow-hidden rounded-xl border bg-card shadow-sm transition hover:border-indigo-200 hover:shadow-md"
        >
          <div className="border-b bg-muted/30 p-4">
            <Image src={mode.image} alt={mode.label} width={120} height={80} className="mx-auto" />
          </div>
          <div className="space-y-2 p-4">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-semibold">{mode.label}</h4>
              <Badge variant="outline" className="text-[10px]">
                {mode.badge}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">언제: </span>
              {mode.when}
            </p>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">방법: </span>
              {mode.how}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
