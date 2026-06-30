import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function StepGuideCard({
  step,
  title,
  summary,
  image,
  href,
  details,
  className,
  reverse,
}: {
  step: number;
  title: string;
  summary: string;
  image: string;
  href?: string;
  details?: readonly string[];
  className?: string;
  reverse?: boolean;
}) {
  const content = (
    <article
      className={cn(
        "group grid gap-6 rounded-2xl border bg-card p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md md:grid-cols-2 md:items-center",
        reverse && "md:[direction:rtl] md:*:[direction:ltr]",
        className,
      )}
    >
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
          STEP {step}
        </div>
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{summary}</p>
        {details && (
          <ul className="space-y-2 text-sm">
            {details.map((line) => (
              <li key={line} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        )}
        {href && (
          <span className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 group-hover:underline">
            자세히 보기 <ArrowRight className="h-4 w-4" />
          </span>
        )}
      </div>
      <div className="overflow-hidden rounded-xl border bg-muted/30">
        <Image src={image} alt={title} width={480} height={280} className="h-auto w-full" />
      </div>
    </article>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }
  return content;
}
