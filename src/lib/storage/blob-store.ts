import { put } from "@vercel/blob";

export function isBlobStorageEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

export async function uploadCloneAsset(
  runId: string,
  fileName: string,
  data: Buffer,
  contentType?: string,
): Promise<string> {
  const pathname = `clones/${runId}/assets/${fileName}`;
  const blob = await put(pathname, data, {
    access: "public",
    contentType: contentType ?? "application/octet-stream",
    addRandomSuffix: false,
  });
  return blob.url;
}

export async function uploadCloneHtml(runId: string, html: string): Promise<string> {
  const pathname = `clones/${runId}/source.html`;
  const blob = await put(pathname, html, {
    access: "public",
    contentType: "text/html; charset=utf-8",
    addRandomSuffix: false,
  });
  return blob.url;
}

export function isBlobUrl(value: string): boolean {
  return value.startsWith("https://") && value.includes(".blob.vercel-storage.com");
}
