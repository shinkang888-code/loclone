import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { newId, writeDb } from "@/lib/store/file-store";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  try {
    await requireUser();
    const { id } = await params;
    const token = process.env.VERCEL_TOKEN?.trim();

    if (!token) {
      return NextResponse.json({
        ok: false,
        error: "VERCEL_TOKEN이 설정되지 않았습니다. 대기 목록을 확인하세요.",
        needsHuman: true,
      }, { status: 422 });
    }

    const deployment = {
      id: newId(),
      projectId: id,
      provider: "vercel",
      url: null,
      status: "pending_human",
      createdAt: new Date().toISOString(),
    };

    await writeDb((db) => {
      db.deployments.push(deployment);
      db.waitingItems.push({
        id: newId(),
        category: "deployment",
        title: `Vercel 배포 확인: 프로젝트 ${id}`,
        description:
          "VERCEL_TOKEN은 설정되었지만 자동 배포 파이프라인은 수동 연결이 필요합니다. Vercel 대시보드에서 Git 연동 또는 CLI deploy를 실행하세요.",
        actionUrl: "https://vercel.com/new",
        status: "pending",
        createdAt: new Date().toISOString(),
      });
    });

    return NextResponse.json({
      ok: true,
      deployment,
      message: "배포 요청이 등록되었습니다. 대기 목록에서 수동 배포를 완료하세요.",
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "error";
    if (msg === "UNAUTHORIZED") return NextResponse.json({ ok: false, error: msg }, { status: 401 });
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
