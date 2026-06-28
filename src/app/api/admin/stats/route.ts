import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { readDb } from "@/lib/store/file-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    if (user.role !== "admin" && user.role !== "staff") {
      return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
    }
    const db = await readDb();
    const stats = {
      users: db.users.length,
      projects: db.projects.length,
      runs: db.cloneRuns.length,
      successRuns: db.cloneRuns.filter((r) => r.status === "success").length,
      sites: db.sites.length,
      waitingPending: db.waitingItems.filter((w) => w.status === "pending").length,
    };
    return NextResponse.json({ ok: true, stats, users: db.users });
  } catch {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }
}
