import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import { readDb } from "@/lib/store/file-store";

export async function POST() {
  const db = await readDb();
  const user = db.users[0];
  if (!user) {
    return NextResponse.json({ ok: false, error: "No dev user" }, { status: 500 });
  }
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, user.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return NextResponse.json({ ok: true, user });
}
