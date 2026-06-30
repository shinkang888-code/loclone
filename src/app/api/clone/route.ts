import { NextResponse } from "next/server";
import { cloneRequestSchema } from "@/lib/schemas/project";
import { runCloneForProject } from "@/lib/clone/run-clone";
import { requireUser } from "@/lib/auth/session";
import { readDb } from "@/lib/store/file-store";
import type { CloneResponse } from "@/types/clone";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = cloneRequestSchema.parse(await request.json());

    const db = await readDb();
    const project = db.projects[0];
    if (!project) {
      return NextResponse.json<CloneResponse>(
        { ok: false, error: "프로젝트를 먼저 생성하세요." },
        { status: 400 },
      );
    }

    const { result, waitingHint } = await runCloneForProject(
      project.id,
      body.url,
      user.id,
      body.mode,
      body.options,
    );

    if (!result) {
      return NextResponse.json<CloneResponse>({
        ok: true,
        waitingRequired: true,
        error: waitingHint ?? "대기 목록 확인",
      });
    }

    return NextResponse.json<CloneResponse>({ ok: true, result });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "클로닝 처리 중 알 수 없는 오류가 발생했습니다.";
    return NextResponse.json<CloneResponse>(
      { ok: false, error: message },
      { status: 500 },
    );
  }
}
