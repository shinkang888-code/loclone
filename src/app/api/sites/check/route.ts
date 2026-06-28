import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { readDb, writeDb } from "@/lib/store/file-store";
import type { Site } from "@/lib/store/types";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

async function checkOne(site: Site): Promise<{ status: "up" | "down"; code: number | null }> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(site.url, {
      method: "GET",
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timer);
    return { status: res.status < 400 ? "up" : "down", code: res.status };
  } catch {
    return { status: "down", code: null };
  }
}

async function runCheck() {
  await requireUser();
  const db = await readDb();
  const results = await Promise.all(db.sites.map(checkOne));

  await writeDb((d) => {
    for (let i = 0; i < d.sites.length; i++) {
      d.sites[i].status = results[i].status;
      d.sites[i].httpCode = results[i].code;
      d.sites[i].lastChecked = new Date().toISOString();
    }
  });

  const updated = await readDb();
  return NextResponse.json({ ok: true, sites: updated.sites });
}

export async function GET() {
  try {
    return await runCheck();
  } catch {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }
}

export async function POST() {
  try {
    return await runCheck();
  } catch {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }
}
