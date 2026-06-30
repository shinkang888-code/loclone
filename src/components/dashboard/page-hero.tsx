"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LCLONE_BRAND } from "@/lib/brand/tokens";
import { buttonVariants } from "@/components/ui/button";

export function PageHero({
  title,
  description,
  image,
  imageAlt,
  actions,
  className,
}: {
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
  actions?: Array<{ label: string; href: string; variant?: "default" | "outline" }>;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative min-h-[280px] overflow-hidden rounded-2xl border border-white/10 lclone-card-glow",
        className,
      )}
    >
      <Image
        src={LCLONE_BRAND.images.heroReplication}
        alt=""
        fill
        className="object-cover opacity-40"
        sizes="(max-width: 1200px) 100vw, 1200px"
        priority
      />
      <div className="absolute inset-0 lclone-hero-bg opacity-90" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_30%,rgba(77,163,255,0.15),transparent_50%)]" />

      <div className="relative z-10 grid gap-8 p-8 md:p-10 lg:grid-cols-[1fr_320px] lg:items-center">
        <div className="space-y-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#A8D4FF]">
            {LCLONE_BRAND.tagline}
          </p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
          <p className="max-w-xl text-base leading-relaxed text-[#A8B4C4] md:text-lg">
            {description}
          </p>
          {actions && actions.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-2">
              {actions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    action.variant === "outline"
                      ? "border-white/25 bg-white/5 text-white hover:bg-white/10"
                      : "border-0 bg-gradient-to-r from-[#4A7DB8] to-[#6B9FD4] text-white shadow-lg shadow-[#4A7DB8]/25 hover:opacity-95",
                  )}
                >
                  {action.label}
                </Link>
              ))}
            </div>
          )}
        </div>
        {image && (
          <div className="overflow-hidden rounded-xl border border-white/15 bg-[#141B26]/60 shadow-2xl backdrop-blur-sm">
            <Image
              src={image}
              alt={imageAlt ?? title}
              width={640}
              height={360}
              className="h-auto w-full"
              priority
            />
          </div>
        )}
      </div>
    </section>
  );
}
