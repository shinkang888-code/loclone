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
