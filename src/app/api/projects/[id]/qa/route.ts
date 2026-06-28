import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { runQaForProject } from "@/lib/qa/run-qa";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireUser();
    const { id } = await params;
    const { readDb } = await import("@/lib/store/file-store");
    const db = await readDb();
    const qa = db.qaReports
      .filter((q) => q.projectId === id)
      .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())[0];
    return NextResponse.json({ ok: true, qa });
  } catch {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }
}

export async function POST(_request: Request, { params }: Params) {
  try {
    await requireUser();
    const { id } = await params;
    const qa = await runQaForProject(id);
    return NextResponse.json({ ok: true, qa });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "error";
    if (msg === "UNAUTHORIZED") return NextResponse.json({ ok: false, error: msg }, { status: 401 });
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
