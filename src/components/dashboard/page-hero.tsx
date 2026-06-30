"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
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
        "relative overflow-hidden rounded-2xl border bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 p-8 text-white shadow-lg md:p-10",
        className,
      )}
    >
      <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_280px] lg:items-center">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
          <p className="max-w-xl text-base text-indigo-100 md:text-lg">{description}</p>
          {actions && actions.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-2">
              {actions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    action.variant === "outline"
                      ? "border-white/30 bg-white/10 text-white hover:bg-white/20"
                      : "bg-white text-indigo-700 hover:bg-indigo-50",
                  )}
                >
                  {action.label}
                </Link>
              ))}
            </div>
          )}
        </div>
        {image && (
          <div className="hidden overflow-hidden rounded-xl border border-white/20 bg-white/10 lg:block">
            <Image
              src={image}
              alt={imageAlt ?? title}
              width={560}
              height={280}
              className="h-auto w-full"
              priority
            />
          </div>
        )}
      </div>
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
    </section>
  );
}
