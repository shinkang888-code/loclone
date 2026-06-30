import { NextResponse } from "next/server";
import { isPostgresConfigured, readDb } from "@/lib/store/file-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await readDb();
    return NextResponse.json({
      ok: true,
      store: isPostgresConfigured() ? "neon" : "file",
      users: db.users.length,
      projects: db.projects.length,
      runs: db.cloneRuns.length,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "health failed" },
      { status: 500 },
    );
  }
}
