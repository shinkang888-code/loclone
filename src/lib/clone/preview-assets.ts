import { readFile } from "node:fs/promises";
import path from "node:path";
import { findCloneRunByResultId, getMetaForCloneRun } from "@/lib/clone/artifact-content";
import { isBlobUrl } from "@/lib/storage/blob-store";
import { getClonesDir } from "@/lib/storage/paths";

type SavedAsset = { sourceUrl: string; localPath: string };

export async function resolveCloneAsset(
  resultRunId: string,
  assetPath: string,
): Promise<{ redirectUrl?: string; filePath?: string } | null> {
  const cloneRun = await findCloneRunByResultId(resultRunId);
  if (!cloneRun) return null;

  const meta = await getMetaForCloneRun(cloneRun.id);
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
