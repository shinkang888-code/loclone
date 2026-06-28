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
    const run = db.cloneRuns.find((r) => r.id === runId);
    if (!run) {
      return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
    }
    const artifacts = db.artifacts.filter((a) => a.runId === runId);
    const steps = db.cloneRunSteps.filter((s) => s.runId === runId);
    const project = db.projects.find((p) => p.id === run.projectId);
    return NextResponse.json({ ok: true, run, artifacts, steps, project });
  } catch {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }
}
