"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Artifact } from "@/lib/store/types";

export type ArtifactWithContent = Artifact & { content?: string | null };

export function ArtifactList({ artifacts }: { artifacts: ArtifactWithContent[] }) {
  if (artifacts.length === 0) {
    return <p className="text-sm text-muted-foreground">아티팩트 없음</p>;
  }

  return (
    <div className="space-y-3">
      {artifacts.map((a) => (
        <Card key={a.id}>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{a.type}</Badge>
            <code className="text-xs">{a.path}</code>
          </div>
          {a.content && a.type === "meta" && (
            <pre className="mt-2 max-h-40 overflow-auto text-xs">{a.content.slice(0, 800)}</pre>
          )}
          {a.content && a.type === "html" && (
            <p className="mt-2 text-xs text-muted-foreground">
              HTML {a.content.length.toLocaleString()} chars
            </p>
          )}
        </Card>
      ))}
    </div>
  );
}

// Extended type for API response — exported above
