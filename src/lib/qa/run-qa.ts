import { readFile } from "node:fs/promises";
import { readDb } from "@/lib/store/file-store";
import type { QaIssue, QaReport } from "@/lib/store/types";
import { newId, writeDb } from "@/lib/store/file-store";
import { detectTechStack, extractDesignTokens } from "@/lib/qa/analysis";

export async function runQaForProject(projectId: string): Promise<QaReport> {
  const db = await readDb();
  const project = db.projects.find((p) => p.id === projectId);
  if (!project) {
    throw new Error("프로젝트를 찾을 수 없습니다.");
  }

  const runs = db.cloneRuns
    .filter((r) => r.projectId === projectId && r.status === "success")
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

  const latestRun = runs[0];
  const issues: QaIssue[] = [];

  let seoScore = 50;
  let perfScore = 70;
  let a11yScore = 60;
  let designScore = 65;
  let designTokens: string[] = [];
  let techStack: string[] = [];

  if (!latestRun) {
    issues.push({
      category: "clone",
      severity: "high",
      message: "성공한 클론 실행이 없습니다.",
      fix: "Clone 탭에서 URL을 실행하세요.",
    });
    seoScore = 0;
    perfScore = 0;
    a11yScore = 0;
  } else {
    const metaArtifact = db.artifacts.find(
      (a) => a.runId === latestRun.id && a.type === "meta",
    );
    const htmlArtifact = db.artifacts.find(
      (a) => a.runId === latestRun.id && a.type === "html",
    );

    designTokens = await extractDesignTokens(
      htmlArtifact?.path ?? null,
      typeof htmlArtifact?.metadata?.htmlContent === "string"
        ? htmlArtifact.metadata.htmlContent
        : null,
    );
    techStack = await detectTechStack(
      htmlArtifact?.path ?? null,
      typeof htmlArtifact?.metadata?.htmlContent === "string"
        ? htmlArtifact.metadata.htmlContent
        : null,
    );
    if (designTokens.length >= 5) designScore += 15;
    if (techStack.length > 0) {
      issues.push({
        category: "tech",
        severity: "low",
        message: `감지된 스택: ${techStack.join(", ")}`,
      });
    }

    if (metaArtifact) {
      try {
        let meta: { title?: string; description?: string };
        if (metaArtifact.metadata?.metadataJson) {
          meta = metaArtifact.metadata.metadataJson as { title?: string; description?: string };
        } else if (metaArtifact.metadata?.title) {
          meta = metaArtifact.metadata as { title?: string; description?: string };
        } else {
          const raw = await readFile(metaArtifact.path, "utf-8");
          meta = JSON.parse(raw) as { title?: string; description?: string };
        }
        if (!meta.title || meta.title === "Untitled") {
          issues.push({
            category: "seo",
            severity: "medium",
            message: "페이지 title이 비어있거나 Untitled입니다.",
            fix: "meta title을 실제 사이트 제목으로 수정하세요.",
          });
          seoScore -= 15;
        } else {
          seoScore += 20;
        }
        if (!meta.description) {
          issues.push({
            category: "seo",
            severity: "low",
            message: "meta description이 없습니다.",
            fix: "SEO 스킬로 description을 생성하세요.",
          });
          seoScore -= 10;
        } else {
          seoScore += 15;
        }
      } catch {
        issues.push({
          category: "qa",
          severity: "medium",
          message: "메타데이터 파일을 읽을 수 없습니다.",
        });
      }
    }

    if (project.targetUrls.length === 0) {
      issues.push({
        category: "project",
        severity: "low",
        message: "프로젝트에 target URL이 등록되지 않았습니다.",
      });
    }

    const assetArtifact = db.artifacts.find(
      (a) => a.runId === latestRun.id && a.type === "asset_list",
    );
    if (assetArtifact?.metadata?.assets) {
      const assets = assetArtifact.metadata.assets as unknown[];
      if (assets.length < 3) {
        issues.push({
          category: "assets",
          severity: "medium",
          message: "다운로드된 에셋이 3개 미만입니다.",
          fix: "브라우저 MCP로 추가 에셋을 추출하세요.",
        });
        perfScore -= 10;
      } else {
        perfScore += 10;
      }
    }
  }

  seoScore = Math.max(0, Math.min(100, seoScore));
  perfScore = Math.max(0, Math.min(100, perfScore));
  a11yScore = Math.max(0, Math.min(100, a11yScore));
  designScore = Math.max(0, Math.min(100, designScore));

  const report: QaReport = {
    id: newId(),
    projectId,
    seoScore,
    perfScore,
    a11yScore,
    designScore,
    designTokens,
    techStack,
    issues,
    generatedAt: new Date().toISOString(),
  };

  await writeDb((d) => {
    d.qaReports.push(report);
  });

  return report;
}
