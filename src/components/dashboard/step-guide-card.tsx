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
        "group grid gap-6 overflow-hidden rounded-2xl border border-white/10 bg-card lclone-card-glow transition hover:border-[#4A7DB8]/35 md:grid-cols-2 md:items-stretch",
        reverse && "md:[direction:rtl] md:*:[direction:ltr]",
        className,
      )}
    >
      <div className="relative min-h-[200px] overflow-hidden bg-[#1E2836] md:min-h-full">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.04]"
          sizes="(max-width:768px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-card/80 via-transparent to-transparent md:bg-gradient-to-t md:from-card md:via-transparent" />
      </div>
      <div className="space-y-4 p-6 md:flex md:flex-col md:justify-center">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#4A7DB8]/30 bg-[#4A7DB8]/10 px-3 py-1 text-xs font-semibold text-[#A8D4FF]">
          STEP {step}
        </div>
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{summary}</p>
        {details && (
          <ul className="space-y-2 text-sm">
            {details.map((line) => (
              <li key={line} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#4DA3FF]" />
                <span className="text-muted-foreground">{line}</span>
              </li>
            ))}
          </ul>
        )}
        {href && (
          <span className="inline-flex items-center gap-1 text-sm font-medium text-[#6B9FD4] group-hover:underline">
            자세히 보기 <ArrowRight className="h-4 w-4" />
          </span>
        )}
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
