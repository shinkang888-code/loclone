import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { getLogsDir } from "@/lib/storage/paths";
import { readDb, writeDb } from "@/lib/store/file-store";

export type RunLogEntry = {
  ts: string;
  level: "info" | "warn" | "error";
  message: string;
};

export async function appendRunLog(
  runId: string,
  message: string,
  level: RunLogEntry["level"] = "info",
): Promise<string> {
  const entry: RunLogEntry = {
    ts: new Date().toISOString(),
    level,
    message,
  };

  const logDir = getLogsDir();
  const logPath = path.join(logDir, `${runId}.jsonl`);

  try {
    await mkdir(logDir, { recursive: true });
    await appendFile(logPath, `${JSON.stringify(entry)}\n`, "utf-8");
  } catch {
    /* /tmp or local write failed — DB fallback below */
  }

  try {
    await writeDb((db) => {
      const run = db.cloneRuns.find((r) => r.id === runId);
      if (run) {
        if (!run.logs) run.logs = [];
        run.logs.push(entry);
      }
    });
  } catch {
    /* run may not exist yet on first line */
  }

  return logPath;
}

export async function getRunLogs(runId: string): Promise<RunLogEntry[]> {
  const db = await readDb();
  const run = db.cloneRuns.find((r) => r.id === runId);
  if (run?.logs?.length) {
    return run.logs;
  }

  try {
    const { readFile } = await import("node:fs/promises");
    const raw = await readFile(path.join(getLogsDir(), `${runId}.jsonl`), "utf-8");
    return raw
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as RunLogEntry);
  } catch {
    return [];
  }
}

export function runLogPath(runId: string): string {
  return path.join(getLogsDir(), `${runId}.jsonl`);
}
