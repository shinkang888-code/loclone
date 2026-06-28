import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { newId, readDb, writeDb } from "@/lib/store/file-store";
import { siteCreateSchema } from "@/lib/schemas/project";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireUser();
    const db = await readDb();
    return NextResponse.json({ ok: true, sites: db.sites });
  } catch {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    await requireUser();
    const body = siteCreateSchema.parse(await request.json());
    const site = {
      id: newId(),
      projectId: body.projectId ?? null,
      name: body.name,
      url: body.url,
      status: "unknown" as const,
      httpCode: null,
      lastChecked: null,
    };
    await writeDb((db) => {
      db.sites.push(site);
    });
    return NextResponse.json({ ok: true, site });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "error";
    if (msg === "UNAUTHORIZED") return NextResponse.json({ ok: false, error: msg }, { status: 401 });
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
