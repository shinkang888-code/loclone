import { readFile } from "node:fs/promises";
import { readDb } from "@/lib/store/file-store";
import type { Artifact } from "@/lib/store/types";
import { isBlobUrl } from "@/lib/storage/blob-store";

export async function findCloneRunByResultId(resultRunId: string) {
  const db = await readDb();
  return db.cloneRuns.find((r) => r.runId === resultRunId) ?? null;
}

export async function getHtmlArtifactForResultRun(resultRunId: string): Promise<{
  artifact: Artifact | null;
  html: string | null;
  htmlBlobUrl?: string | null;
}> {
  const db = await readDb();
  const cloneRun = db.cloneRuns.find((r) => r.runId === resultRunId);
  if (!cloneRun) {
    return { artifact: null, html: null };
  }

  const artifact = db.artifacts.find(
    (a) => a.runId === cloneRun.id && a.type === "html",
  );
  if (!artifact) {
    return { artifact: null, html: null };
  }

  const htmlBlobUrl =
    typeof artifact.metadata?.htmlBlobUrl === "string"
      ? artifact.metadata.htmlBlobUrl
      : null;

  const inline = artifact.metadata?.htmlContent;
  if (typeof inline === "string" && inline.length > 0) {
    return { artifact, html: inline, htmlBlobUrl };
  }

  if (htmlBlobUrl && htmlBlobUrl.startsWith("https://")) {
    try {
      const res = await fetch(htmlBlobUrl, { cache: "no-store" });
      if (res.ok) {
        return { artifact, html: await res.text(), htmlBlobUrl };
      }
    } catch {
      /* fall through */
    }
  }

  if (isBlobUrl(artifact.path)) {
    try {
      const res = await fetch(artifact.path, { cache: "no-store" });
      if (res.ok) {
        return { artifact, html: await res.text(), htmlBlobUrl: artifact.path };
      }
    } catch {
      /* fall through */
    }
  }

  try {
    const html = await readFile(artifact.path, "utf-8");
    return { artifact, html };
  } catch {
    return { artifact, html: null, htmlBlobUrl };
  }
}

export async function getMetaForCloneRun(dbRunId: string): Promise<Record<string, unknown> | null> {
  const db = await readDb();
  const artifact = db.artifacts.find(
    (a) => a.runId === dbRunId && a.type === "meta",
  );
  if (!artifact) return null;

  if (artifact.metadata?.metadataJson) {
    return artifact.metadata.metadataJson as Record<string, unknown>;
  }

  try {
    const raw = await readFile(artifact.path, "utf-8");
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return artifact.metadata;
  }
}
