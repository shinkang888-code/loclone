import { createWriteStream } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import archiver from "archiver";
import { readDb } from "@/lib/store/file-store";
import { getClonesDir, getExportsDir, getResearchRunsDir } from "@/lib/storage/paths";

export async function exportProjectZip(projectId: string): Promise<string> {
  const db = await readDb();
  const project = db.projects.find((p) => p.id === projectId);
  if (!project) {
    throw new Error("프로젝트를 찾을 수 없습니다.");
  }

  const exportDir = getExportsDir();
  await mkdir(exportDir, { recursive: true });
  const zipPath = path.join(exportDir, `${projectId}.zip`);

  const runs = db.cloneRuns.filter((r) => r.projectId === projectId);
  const latestRun = runs.sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  )[0];
  const latestQa = db.qaReports
    .filter((q) => q.projectId === projectId)
    .sort(
      (a, b) =>
        new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime(),
    )[0];

  const archive = archiver("zip", { zlib: { level: 9 } });
  const output = createWriteStream(zipPath);
  archive.pipe(output);

  const readme = `# ${project.name}\n\n${project.description ?? ""}\n\n## Target URLs\n${project.targetUrls.map((u) => `- ${u}`).join("\n")}\n`;
  archive.append(readme, { name: "README.md" });

  if (latestRun?.runId) {
    const cloneDir = path.join(getClonesDir(), latestRun.runId);
    try {
      archive.directory(cloneDir, `clones/${latestRun.runId}`);
    } catch {
      /* empty clone dir */
    }
    const metaPath = path.join(getResearchRunsDir(), latestRun.runId);
    try {
      archive.directory(metaPath, `research/${latestRun.runId}`);
    } catch {
      /* empty */
    }

    const htmlArtifact = db.artifacts.find(
      (a) => a.runId === latestRun.id && a.type === "html",
    );
    if (typeof htmlArtifact?.metadata?.htmlContent === "string") {
      archive.append(htmlArtifact.metadata.htmlContent, {
        name: `clones/${latestRun.runId}/source.html`,
      });
    }
  }

  const handoff = await readFile(
    path.join(process.cwd(), "docs", "HANDOFF.md"),
    "utf-8",
  ).catch(() => "# Handoff\nSee docs/HANDOFF.md in repo.");
  archive.append(handoff, { name: "HANDOFF.md" });

  if (latestQa) {
    archive.append(JSON.stringify(latestQa, null, 2), { name: "qa/report.json" });
  }

  await archive.finalize();
  await new Promise<void>((resolve, reject) => {
    output.on("close", () => resolve());
    output.on("error", reject);
  });

  return zipPath;
}
