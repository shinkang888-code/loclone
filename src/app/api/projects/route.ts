import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { newId, readDb, writeDb } from "@/lib/store/file-store";
import { projectCreateSchema } from "@/lib/schemas/project";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    const db = await readDb();
    const projects = db.projects
      .filter((p) => p.createdBy === user.id || user.role !== "user")
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return NextResponse.json({ ok: true, projects });
  } catch {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = projectCreateSchema.parse(await request.json());
    const now = new Date().toISOString();
    const project = {
      id: newId(),
      name: body.name,
      description: body.description ?? null,
      targetUrls: body.targetUrls,
      status: "draft" as const,
      fidelity: body.fidelity,
      createdBy: user.id,
      createdAt: now,
      updatedAt: now,
    };
    await writeDb((db) => {
      db.projects.push(project);
    });
    return NextResponse.json({ ok: true, project });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Invalid request" },
      { status: 400 },
    );
  }
}
