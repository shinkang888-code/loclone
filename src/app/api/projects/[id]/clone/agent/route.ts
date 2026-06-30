import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { ensureWaitingForMode } from "@/lib/clone/waiting-bridge";
import { runCloneForProject } from "@/lib/clone/run-clone";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = (await request.json()) as { url: string };
    if (!body.url) {
      return NextResponse.json({ ok: false, error: "URL 필요" }, { status: 400 });
    }

    await ensureWaitingForMode("agent-pixel");
    const { run, waitingHint } = await runCloneForProject(
      id,
      body.url,
      user.id,
      "agent-pixel",
    );

    return NextResponse.json({
      ok: true,
      run,
      waitingHint: waitingHint ?? "/dashboard/waiting",
      message: "Cursor에서 /clone-website 스킬을 실행하세요.",
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "error";
    if (msg === "UNAUTHORIZED") return NextResponse.json({ ok: false, error: msg }, { status: 401 });
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
