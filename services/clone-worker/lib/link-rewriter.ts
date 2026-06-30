export function rewriteHtmlLinks(html: string, pageUrl: string, assetMap: Map<string, string>): string {
  let out = html;
  for (const [abs, rel] of assetMap) {
    out = out.split(abs).join(rel);
  }
  try {
    const origin = new URL(pageUrl).origin;
    out = out.split(origin).join("");
  } catch {
    /* ignore */
  }
  return out;
}

export function relativeAssetPath(runId: string, fileName: string): string {
  return `/clones/${runId}/assets/${fileName}`;
}
