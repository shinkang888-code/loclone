import { readFile } from "node:fs/promises";

export async function extractDesignTokens(htmlPath: string | null, inlineHtml?: string | null): Promise<string[]> {
  let html = inlineHtml ?? null;
  if (!html && htmlPath) {
    try {
      html = await readFile(htmlPath, "utf-8");
    } catch {
      return [];
    }
  }
  if (!html) return [];

  try {
    const colors = new Set<string>();
    const hexRe = /#([0-9a-fA-F]{3,8})\b/g;
    let m = hexRe.exec(html);
    while (m) {
      colors.add(`#${m[1]}`);
      m = hexRe.exec(html);
    }
    return [...colors].slice(0, 12).map((c) => `color: ${c}`);
  } catch {
    return [];
  }
}

export async function detectTechStack(htmlPath: string | null, inlineHtml?: string | null): Promise<string[]> {
  let html = inlineHtml ?? null;
  if (!html && htmlPath) {
    try {
      html = await readFile(htmlPath, "utf-8");
    } catch {
      return [];
    }
  }
  if (!html) return [];

  try {
    const stack: string[] = [];
    if (html.includes("__NEXT_DATA__")) stack.push("Next.js");
    if (html.includes("__NUXT__")) stack.push("Nuxt");
    if (html.includes("ng-version")) stack.push("Angular");
    if (html.includes("data-reactroot") || html.includes("_reactRoot")) stack.push("React");
    if (html.includes("tailwind")) stack.push("Tailwind CSS");
    if (html.includes("bootstrap")) stack.push("Bootstrap");
    if (stack.length === 0) stack.push("Static HTML");
    return stack;
  } catch {
    return [];
  }
}
