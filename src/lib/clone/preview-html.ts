import { getMetaForResultRun, findCloneRunByResultId } from "@/lib/clone/artifact-content";
import { isBlobUrl } from "@/lib/storage/blob-store";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getClonesDir } from "@/lib/storage/paths";

/** iframe 미리보기용 HTML 경로 보정 (Vercel: /clones → /api/clones) */
export function preparePreviewHtml(html: string, runId: string): string {
  let out = html;

  out = out.replaceAll(`/clones/${runId}/`, `/api/clones/${runId}/`);
  out = out.replaceAll(`"/clones/${runId}`, `"/api/clones/${runId}`);
  out = out.replaceAll(`'/clones/${runId}`, `'/api/clones/${runId}`);

  if (!out.includes("<base ") && !out.includes("<BASE ")) {
    const baseTag = `<base href="/api/clones/${runId}/">`;
    if (out.includes("<head>")) {
      out = out.replace("<head>", `<head>${baseTag}`);
    } else if (out.includes("<HEAD>")) {
      out = out.replace("<HEAD>", `<HEAD>${baseTag}`);
    } else {
      out = `<!DOCTYPE html><html><head>${baseTag}</head>${out}</html>`;
    }
  }

  return out;
}

/** 본문 텍스트가 거의 없으면 SPA/정적 모드 불일치 가능성 */
export function isLikelyEmptyPreview(html: string): boolean {
  const withoutScripts = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "");
  const text = withoutScripts.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.length < 40;
}

type SavedAsset = { sourceUrl: string; localPath: string };

export async function resolveCloneAsset(
  resultRunId: string,
  assetPath: string,
): Promise<{ redirectUrl?: string; filePath?: string } | null> {
  const cloneRun = await findCloneRunByResultId(resultRunId);
  if (!cloneRun) return null;

  const meta = await getMetaForResultRun(cloneRun.id);
  const assets = (meta?.downloadedAssets ?? []) as SavedAsset[];
  const fileName = path.basename(assetPath);

  const match =
    assets.find((a) => a.localPath.endsWith(`/${fileName}`)) ??
    assets.find((a) => a.localPath.includes(fileName));

  if (match && isBlobUrl(match.localPath)) {
    return { redirectUrl: match.localPath };
  }

  try {
    const filePath = path.join(getClonesDir(), resultRunId, assetPath);
    await readFile(filePath);
    return { filePath };
  } catch {
    if (match?.localPath.startsWith("/")) {
      try {
        const altPath = path.join(process.cwd(), "public", match.localPath);
        await readFile(altPath);
        return { filePath: altPath };
      } catch {
        /* fall through */
      }
    }
    return null;
  }
}
