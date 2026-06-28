import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { LocloneDb } from "./types";

const DB_PATH = path.join(process.cwd(), "storage", "loclone-db.json");

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

let writeQueue: Promise<void> = Promise.resolve();

async function ensureDb(): Promise<LocloneDb> {
  await mkdir(path.dirname(DB_PATH), { recursive: true });
  try {
    const raw = await readFile(DB_PATH, "utf-8");
    return JSON.parse(raw) as LocloneDb;
  } catch {
    const seeded = seedDb();
    await writeFile(DB_PATH, JSON.stringify(seeded, null, 2), "utf-8");
    return seeded;
  }
}

function seedDb(): LocloneDb {
  const devUserId = "dev-user-0001";
  return {
    ...EMPTY_DB,
    users: [
      {
        id: devUserId,
        email: "dev@loclone.local",
        role: "admin",
        createdAt: new Date().toISOString(),
      },
    ],
    entitlements: [
      {
        userId: devUserId,
        plan: "pro",
        cloneLimit: 999,
        cloneUsed: 0,
      },
    ],
  };
}

export async function readDb(): Promise<LocloneDb> {
  return ensureDb();
}

export async function writeDb(mutator: (db: LocloneDb) => void): Promise<LocloneDb> {
  writeQueue = writeQueue.then(async () => {
    const db = await ensureDb();
    mutator(db);
    await writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
  });
  await writeQueue;
  return ensureDb();
}

export function newId(): string {
  return randomUUID();
}
