import { neon } from "@neondatabase/serverless";
import type { LocloneDb } from "./types";

const EMPTY_DB: LocloneDb = {
  users: [],
  projects: [],
  cloneRuns: [],
  artifacts: [],
  cloneRunSteps: [],
  qaReports: [],
  sites: [],
  deployments: [],
  waitingItems: [],
  entitlements: [],
};

function sql() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error("DATABASE_URL이 설정되지 않았습니다.");
  }
  return neon(url);
}

export function isPostgresConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export async function readPostgresDb(): Promise<LocloneDb> {
  const db = sql();
  const rows = await db`SELECT data FROM loclone_state WHERE id = 'main' LIMIT 1`;
  if (!rows[0]?.data) {
    await writePostgresDb(EMPTY_DB);
    return EMPTY_DB;
  }
  return rows[0].data as LocloneDb;
}

export async function writePostgresDb(data: LocloneDb): Promise<void> {
  const db = sql();
  await db`
    INSERT INTO loclone_state (id, data, updated_at)
    VALUES ('main', ${JSON.stringify(data)}::jsonb, now())
    ON CONFLICT (id) DO UPDATE
    SET data = EXCLUDED.data, updated_at = now()
  `;
}
