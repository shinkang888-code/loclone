import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import {
  isPostgresConfigured,
  readPostgresDb,
  writePostgresDb,
} from "./postgres-store";
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

function migrateDb(db: LocloneDb): boolean {
  let changed = false;
  for (const run of db.cloneRuns) {
    if (!run.mode) {
      run.mode = "static";
      changed = true;
    }
    if (run.progress == null) {
      run.progress = run.status === "success" ? 100 : 0;
      changed = true;
    }
    if (run.options === undefined) {
      run.options = null;
      changed = true;
    }
    if (run.workerJobId === undefined) {
      run.workerJobId = null;
      changed = true;
    }
    if (run.logPath === undefined) {
      run.logPath = null;
      changed = true;
    }
    if (run.logs === undefined) {
      run.logs = [];
      changed = true;
    }
  }
  return changed;
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

async function ensureFileDb(): Promise<LocloneDb> {
  await mkdir(path.dirname(DB_PATH), { recursive: true });
  try {
    const raw = await readFile(DB_PATH, "utf-8");
    const db = JSON.parse(raw) as LocloneDb;
    const changed = migrateDb(db);
    if (changed) {
      await writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
    }
    return db;
  } catch {
    const seeded = seedDb();
    await writeFile(DB_PATH, JSON.stringify(seeded, null, 2), "utf-8");
    return seeded;
  }
}

async function ensureDb(): Promise<LocloneDb> {
  if (isPostgresConfigured()) {
    const db = await readPostgresDb();
    const changed = migrateDb(db);
    if (changed) {
      await writePostgresDb(db);
    }
    if (db.users.length === 0) {
      const seeded = seedDb();
      await writePostgresDb(seeded);
      return seeded;
    }
    return db;
  }
  return ensureFileDb();
}

export async function readDb(): Promise<LocloneDb> {
  return ensureDb();
}

export async function writeDb(mutator: (db: LocloneDb) => void): Promise<LocloneDb> {
  writeQueue = writeQueue.then(async () => {
    const db = await ensureDb();
    mutator(db);
    if (isPostgresConfigured()) {
      await writePostgresDb(db);
    } else {
      await writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
    }
  });
  await writeQueue;
  return ensureDb();
}

export function newId(): string {
  return randomUUID();
}

export { isPostgresConfigured };
