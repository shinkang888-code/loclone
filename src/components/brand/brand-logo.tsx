import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LCLONE_BRAND } from "@/lib/brand/tokens";

export function BrandLogo({
  size = "md",
  showWordmark = true,
  className,
  href = "/dashboard",
}: {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  className?: string;
  href?: string;
}) {
  const sizes = { sm: 32, md: 40, lg: 52 } as const;
  const px = sizes[size];

  const inner = (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className="relative shrink-0 overflow-hidden rounded-xl ring-1 ring-white/10"
        style={{ width: px, height: px }}
      >
        <Image
          src={LCLONE_BRAND.images.logoMark}
          alt={LCLONE_BRAND.name}
          width={px}
          height={px}
          className="h-full w-full object-cover"
          priority
        />
      </div>
      {showWordmark && (
        <div className="min-w-0">
          <p className="truncate text-base font-semibold tracking-tight">
            <span className="text-[#7EB8E8]">L</span>
            <span className="text-foreground">clone</span>
          </p>
          {size !== "sm" && (
            <p className="truncate text-[11px] text-muted-foreground">
              {LCLONE_BRAND.taglineKo}
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="transition-opacity hover:opacity-90">
        {inner}
      </Link>
    );
  }
  return inner;
}
