import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { readDb, writeDb } from "@/lib/store/file-store";
import { projectUpdateSchema } from "@/lib/schemas/project";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const db = await readDb();
    const project = db.projects.find((p) => p.id === id);
    if (!project) {
      return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
    }
    if (project.createdBy !== user.id && user.role === "user") {
      return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
    }
    const runs = db.cloneRuns.filter((r) => r.projectId === id);
    const qa = db.qaReports
      .filter((q) => q.projectId === id)
      .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())[0];
    return NextResponse.json({ ok: true, project, runs, qa });
  } catch {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = projectUpdateSchema.parse(await request.json());
    await writeDb((db) => {
      const project = db.projects.find((p) => p.id === id);
      if (!project) throw new Error("NOT_FOUND");
      if (project.createdBy !== user.id && user.role === "user") throw new Error("FORBIDDEN");
      Object.assign(project, body, { updatedAt: new Date().toISOString() });
    });
    const db = await readDb();
    const project = db.projects.find((p) => p.id === id);
    return NextResponse.json({ ok: true, project });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "error";
    if (msg === "UNAUTHORIZED") return NextResponse.json({ ok: false, error: msg }, { status: 401 });
    if (msg === "NOT_FOUND") return NextResponse.json({ ok: false, error: msg }, { status: 404 });
    if (msg === "FORBIDDEN") return NextResponse.json({ ok: false, error: msg }, { status: 403 });
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    await writeDb((db) => {
      const project = db.projects.find((p) => p.id === id);
      if (!project) throw new Error("NOT_FOUND");
      if (project.createdBy !== user.id && user.role === "user") throw new Error("FORBIDDEN");
      db.projects = db.projects.filter((p) => p.id !== id);
      const runIds = db.cloneRuns.filter((r) => r.projectId === id).map((r) => r.id);
      db.cloneRuns = db.cloneRuns.filter((r) => r.projectId !== id);
      db.artifacts = db.artifacts.filter((a) => !runIds.includes(a.runId));
      db.cloneRunSteps = db.cloneRunSteps.filter((s) => !runIds.includes(s.runId));
      db.qaReports = db.qaReports.filter((q) => q.projectId !== id);
      db.sites = db.sites.filter((s) => s.projectId !== id);
      db.deployments = db.deployments.filter((d) => d.projectId !== id);
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "error";
    if (msg === "UNAUTHORIZED") return NextResponse.json({ ok: false, error: msg }, { status: 401 });
    if (msg === "NOT_FOUND") return NextResponse.json({ ok: false, error: msg }, { status: 404 });
    if (msg === "FORBIDDEN") return NextResponse.json({ ok: false, error: msg }, { status: 403 });
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
