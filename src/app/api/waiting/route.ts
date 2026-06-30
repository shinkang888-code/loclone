import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { listWaitingItems, markWaitingDone, scanWaitingItems } from "@/lib/store/waiting";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireUser();
    await scanWaitingItems();
    const items = await listWaitingItems();
    return NextResponse.json({ ok: true, items });
  } catch {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }
}

export async function POST() {
  try {
    await requireUser();
    const items = await scanWaitingItems();
    return NextResponse.json({ ok: true, items });
  } catch {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireUser();
    const body = (await request.json()) as { id: string };
    const item = await markWaitingDone(body.id);
    return NextResponse.json({ ok: true, item });
  } catch {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }
}
