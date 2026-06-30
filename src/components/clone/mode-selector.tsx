"use client";

import { cn } from "@/lib/utils";
import {
  CLONE_MODES,
  MODE_PRESETS,
  type CloneMode,
  type CloneOptions,
} from "@/types/clone";

export function ModeSelector({
  mode,
  options,
  onModeChange,
  onOptionsChange,
  showAdvanced,
  onToggleAdvanced,
}: {
  mode: CloneMode;
  options: CloneOptions;
  onModeChange: (mode: CloneMode) => void;
  onOptionsChange: (options: CloneOptions) => void;
  showAdvanced?: boolean;
  onToggleAdvanced?: () => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium">클론 모드</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {CLONE_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                onModeChange(m.id);
                onOptionsChange({ ...MODE_PRESETS[m.id], ...options });
              }}
              className={cn(
                "rounded-lg border p-3 text-left text-sm transition-colors",
                mode === m.id
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "hover:bg-muted/50",
              )}
            >
              <span className="font-medium">{m.label}</span>
              {m.needsHuman && (
                <span className="ml-1 text-xs text-amber-600">(인간 개입)</span>
              )}
              <p className="mt-1 text-xs text-muted-foreground">{m.description}</p>
            </button>
          ))}
        </div>
      </div>

      {onToggleAdvanced && (
        <button
          type="button"
          className="text-xs text-muted-foreground underline"
          onClick={onToggleAdvanced}
        >
          {showAdvanced ? "고급 옵션 숨기기" : "고급 옵션 보기"}
        </button>
      )}

      {showAdvanced && (
        <div className="grid gap-3 rounded-lg border bg-muted/30 p-4 sm:grid-cols-2">
          <label className="text-sm">
            maxDepth
            <input
              type="number"
              min={0}
              max={10}
              value={options.maxDepth ?? ""}
              onChange={(e) =>
                onOptionsChange({
                  ...options,
                  maxDepth: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="mt-1 w-full rounded-md border bg-background px-2 py-1"
            />
          </label>
          <label className="text-sm">
            maxPages
            <input
              type="number"
              min={1}
              max={500}
              value={options.maxPages ?? ""}
              onChange={(e) =>
                onOptionsChange({
                  ...options,
                  maxPages: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="mt-1 w-full rounded-md border bg-background px-2 py-1"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={options.sameOriginOnly ?? false}
              onChange={(e) =>
                onOptionsChange({ ...options, sameOriginOnly: e.target.checked })
              }
            />
            sameOriginOnly
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={options.seedSitemaps ?? false}
              onChange={(e) =>
                onOptionsChange({ ...options, seedSitemaps: e.target.checked })
              }
            />
            sitemap 시드
          </label>
          <label className="text-sm">
            scraperBackend
            <select
              value={options.scraperBackend ?? "local"}
              onChange={(e) =>
                onOptionsChange({
                  ...options,
                  scraperBackend: e.target.value as CloneOptions["scraperBackend"],
                })
              }
              className="mt-1 w-full rounded-md border bg-background px-2 py-1"
            >
              <option value="local">local (Playwright Worker)</option>
              <option value="crawl4ai">crawl4ai (대기 목록)</option>
              <option value="firecrawl">firecrawl (대기 목록)</option>
            </select>
          </label>
        </div>
      )}
    </div>
  );
}
