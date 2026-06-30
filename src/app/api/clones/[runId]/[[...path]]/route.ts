import { readFile } from "node:fs/promises";
import path from "node:path";
import { getHtmlArtifactForResultRun } from "@/lib/clone/artifact-content";
import { preparePreviewHtml, resolveCloneAsset } from "@/lib/clone/preview-html";
import { isBlobUrl } from "@/lib/storage/blob-store";
import { getClonesDir } from "@/lib/storage/paths";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ runId: string; path?: string[] }> };

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

async function serveHtml(runId: string): Promise<Response | null> {
  const { html, htmlBlobUrl } = await getHtmlArtifactForResultRun(runId);

  if (html) {
    return new Response(preparePreviewHtml(html, runId), {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  if (htmlBlobUrl && isBlobUrl(htmlBlobUrl)) {
    try {
      const res = await fetch(htmlBlobUrl, { cache: "no-store" });
      if (res.ok) {
        const blobHtml = await res.text();
        return new Response(preparePreviewHtml(blobHtml, runId), {
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      }
    } catch {
      /* fall through */
    }
  }

  return null;
}

export async function GET(_request: Request, { params }: Params) {
  const { runId, path: segments } = await params;
  const subPath = segments?.join("/") ?? "index.html";

  if (subPath === "index.html" || subPath === "" || subPath === "source.html") {
    const htmlRes = await serveHtml(runId);
    if (htmlRes) return htmlRes;
  }

  const resolved = await resolveCloneAsset(runId, subPath);
  if (resolved?.redirectUrl) {
    return Response.redirect(resolved.redirectUrl, 302);
  }

  const filePath =
    resolved?.filePath ?? path.join(getClonesDir(), runId, subPath);

  try {
    const data = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    return new Response(data, {
      headers: { "content-type": MIME[ext] ?? "application/octet-stream" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
