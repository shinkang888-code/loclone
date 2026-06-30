import { cn } from "@/lib/utils";

export function SectionHeading({
  title,
  description,
  id,
  className,
}: {
  title: string;
  description?: string;
  id?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <h2 id={id} className="text-xl font-bold tracking-tight md:text-2xl">
        {title}
      </h2>
      {description && <p className="text-sm text-muted-foreground md:text-base">{description}</p>}
    </div>
  );
}
