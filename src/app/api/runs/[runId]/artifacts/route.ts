import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { readDb } from "@/lib/store/file-store";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ runId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireUser();
    const { runId } = await params;
    const db = await readDb();
    const artifacts = db.artifacts.filter((a) => a.runId === runId);

    const enriched = await Promise.all(
      artifacts.map(async (artifact) => {
        let content: string | null = null;
        if (artifact.type === "html") {
          const inline = artifact.metadata?.htmlContent;
          if (typeof inline === "string") {
            content = inline;
          } else {
            try {
              content = await readFile(artifact.path, "utf-8");
            } catch {
              content = null;
            }
          }
        } else if (artifact.type === "meta") {
          if (artifact.metadata?.metadataJson) {
            content = JSON.stringify(artifact.metadata.metadataJson, null, 2);
          } else {
            try {
              content = await readFile(artifact.path, "utf-8");
            } catch {
              content = null;
            }
          }
        }
        return { ...artifact, content };
      }),
    );

    return NextResponse.json({ ok: true, artifacts: enriched });
  } catch {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }
}
