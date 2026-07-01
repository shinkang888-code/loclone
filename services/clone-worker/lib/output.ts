import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  isBlobStorageEnabled,
  uploadCloneAsset,
  uploadCloneHtml,
} from "./blob-store.js";
import { rewriteHtmlLinks } from "./link-rewriter.js";
import type { CloneResult, SavedAssetInfo } from "../types.js";

const MAX_ASSET_BYTES = 12 * 1024 * 1024;
const MAX_HTML_IN_DB = 1_500_000;

function locloneRoot(): string {
  return process.env.LOCLONE_ROOT?.trim() || path.resolve(process.cwd(), "../..");
}

function makeRunId(url: string): string {
  const hostname = new URL(url).hostname.replaceAll(".", "-");
  const timestamp = new Date().toISOString().replaceAll(/[:.]/g, "-");
  return `${hostname}-${timestamp}`;
}

function safeFilename(value: string): string {
  return value.replaceAll(/[^a-zA-Z0-9._-]/g, "-").slice(0, 80);
}

function extFromContentType(contentType: string | null, url: string): string {
  if (contentType?.includes("text/css")) return ".css";
  if (contentType?.includes("javascript")) return ".js";
  if (contentType?.includes("image/jpeg")) return ".jpg";
  if (contentType?.includes("image/png")) return ".png";
  if (contentType?.includes("image/webp")) return ".webp";
  if (contentType?.includes("font/woff2")) return ".woff2";
  if (contentType?.includes("font/woff")) return ".woff";
  const ext = path.extname(new URL(url).pathname);
  return ext || ".bin";
}

export async function savePageOutput(params: {
  sourceUrl: string;
  finalUrl: string;
  html: string;
  title: string;
  description: string | null;
  ogImage: string | null;
  assetBuffers: Map<string, Buffer>;
  pagesCrawled?: number;
  runId?: string;
}): Promise<CloneResult> {
  const root = locloneRoot();
  const runId = params.runId ?? makeRunId(params.sourceUrl);
  const useBlob = isBlobStorageEnabled();

  const docsRunDir = path.join(root, "docs", "research", "runs", runId);
  const publicRunDir = path.join(root, "public", "clones", runId);
  const publicAssetDir = path.join(publicRunDir, "assets");
  const externalDir = path.join(publicRunDir, "_external");

  if (!useBlob || params.assetBuffers.size > 0) {
    await mkdir(docsRunDir, { recursive: true });
    await mkdir(publicAssetDir, { recursive: true });
    await mkdir(externalDir, { recursive: true });
  }

  const downloadedAssets: SavedAssetInfo[] = [];
  const assetMap = new Map<string, string>();
  let index = 0;

  for (const [assetUrl, buffer] of params.assetBuffers) {
    if (buffer.length > MAX_ASSET_BYTES) continue;
    index += 1;
    const baseName = safeFilename(
      path.parse(new URL(assetUrl).pathname).name || `asset-${index}`,
    );
    const ext = extFromContentType(null, assetUrl);
    const fileName = `${String(index).padStart(3, "0")}-${baseName}${ext}`;
    const previewPath = `/api/clones/${runId}/assets/${fileName}`;

    if (useBlob) {
      try {
        const blobUrl = await uploadCloneAsset(runId, fileName, buffer);
        downloadedAssets.push({ sourceUrl: assetUrl, localPath: blobUrl });
        assetMap.set(assetUrl, blobUrl);
        continue;
      } catch {
        /* fall back to local write */
      }
    }

    let subdir = publicAssetDir;
    try {
      if (new URL(assetUrl).origin !== new URL(params.finalUrl).origin) {
        subdir = externalDir;
      }
    } catch {
      /* keep default */
    }
    const fullPath = path.join(subdir, fileName);
    await mkdir(subdir, { recursive: true });
    await writeFile(fullPath, buffer);
    const relBase = subdir === externalDir ? `_external` : `assets`;
    const localPath = `/clones/${runId}/${relBase}/${fileName}`;
    downloadedAssets.push({ sourceUrl: assetUrl, localPath });
    assetMap.set(assetUrl, previewPath);
  }

  let html = rewriteHtmlLinks(params.html, params.finalUrl, assetMap);

  const htmlSnapshotPath = path.join(docsRunDir, "source.html");
  const metadataPath = path.join(docsRunDir, "metadata.json");

  if (!useBlob) {
    await writeFile(htmlSnapshotPath, html, "utf-8");
  }

  const metadata: Record<string, unknown> = {
    runId,
    sourceUrl: params.sourceUrl,
    finalUrl: params.finalUrl,
    title: params.title,
    description: params.description,
    ogImage: params.ogImage,
    downloadedAssets,
    pagesCrawled: params.pagesCrawled ?? 1,
    createdAt: new Date().toISOString(),
    runtime: useBlob ? "worker+blob" : "worker",
  };

  if (!useBlob) {
    await writeFile(metadataPath, JSON.stringify(metadata, null, 2), "utf-8");
  }

  const htmlForDb =
    html.length > MAX_HTML_IN_DB ? html.slice(0, MAX_HTML_IN_DB) : html;

  let htmlBlobUrl: string | undefined;
  if (useBlob) {
    try {
      htmlBlobUrl = await uploadCloneHtml(runId, html);
    } catch {
      /* inline fallback only */
    }
  }

  return {
    runId,
    sourceUrl: params.sourceUrl,
    finalUrl: params.finalUrl,
    title: params.title,
    description: params.description,
    ogImage: params.ogImage,
    htmlSnapshotPath: htmlBlobUrl ?? htmlSnapshotPath,
    metadataPath,
    downloadedAssets,
    pagesCrawled: params.pagesCrawled ?? 1,
    htmlContent: htmlForDb,
    metadataJson: metadata,
    htmlBlobUrl,
  };
}

export { makeRunId, locloneRoot };

