import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { readDb } from "@/lib/store/file-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireUser();
    const db = await readDb();
    const runs = db.cloneRuns.sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
    );
    return NextResponse.json({ ok: true, runs });
  } catch {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }
}
