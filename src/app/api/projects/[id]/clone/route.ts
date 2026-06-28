import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { runCloneForProject } from "@/lib/clone/run-clone";
import { cloneRequestSchema } from "@/lib/schemas/project";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = cloneRequestSchema.parse(await request.json());
    const { run, result } = await runCloneForProject(id, body.url, user.id);
    return NextResponse.json({ ok: true, run, result });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "error";
    if (msg === "UNAUTHORIZED") return NextResponse.json({ ok: false, error: msg }, { status: 401 });
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
