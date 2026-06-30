import { readFile } from "node:fs/promises";
import path from "node:path";
import { getClonesDir } from "@/lib/storage/paths";
import { isBlobUrl } from "@/lib/storage/blob-store";
import { getHtmlArtifactForResultRun } from "@/lib/clone/artifact-content";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ runId: string; path?: string[] }> };

export async function GET(_request: Request, { params }: Params) {
  const { runId, path: segments } = await params;
  const subPath = segments?.join("/") ?? "index.html";

  if (subPath === "index.html" || subPath === "" || subPath === "source.html") {
    const { html, htmlBlobUrl } = await getHtmlArtifactForResultRun(runId);
    if (htmlBlobUrl && isBlobUrl(htmlBlobUrl)) {
      return Response.redirect(htmlBlobUrl, 302);
    }
    if (html) {
      return new Response(html, {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  }

  try {
    const filePath = path.join(getClonesDir(), runId, subPath);
    const data = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const types: Record<string, string> = {
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
    };
    return new Response(data, {
      headers: { "content-type": types[ext] ?? "application/octet-stream" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
