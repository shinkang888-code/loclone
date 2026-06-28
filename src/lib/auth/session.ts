import { cookies } from "next/headers";
import { readDb } from "@/lib/store/file-store";
import type { UserProfile } from "@/lib/store/types";
import { isAuthDisabled, SESSION_COOKIE } from "@/lib/auth/constants";

export async function getSessionUser(): Promise<UserProfile | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) {
    if (isAuthDisabled()) {
      const db = await readDb();
      return db.users[0] ?? null;
    }
    return null;
  }

  const db = await readDb();
  return db.users.find((u) => u.id === sessionId) ?? null;
}

export async function requireUser(): Promise<UserProfile> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}
