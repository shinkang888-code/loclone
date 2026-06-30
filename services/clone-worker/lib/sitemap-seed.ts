const SITEMAP_LOC_RE = /<loc>\s*([^<\s]+)\s*<\/loc>/gi;
const SITEMAP_INDEX_RE = /<sitemap>\s*<loc>\s*([^<\s]+)\s*<\/loc>/gi;

export async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: { "user-agent": "LocloneCloneWorker/0.1" },
    });
    if (!res.ok) return null;
    return res.text();
  } catch {
    return null;
  }
}

export async function discoverSitemapUrls(startUrl: string): Promise<string[]> {
  const origin = new URL(startUrl).origin;
  const candidates = [
    `${origin}/sitemap.xml`,
    `${origin}/sitemap_index.xml`,
    `${origin}/sitemap-index.xml`,
  ];

  const found = new Set<string>();

  for (const sitemapUrl of candidates) {
    await crawlSitemapRecursive(sitemapUrl, found, 0);
  }

  return [...found];
}

async function crawlSitemapRecursive(
  sitemapUrl: string,
  found: Set<string>,
  depth: number,
): Promise<void> {
  if (depth > 5) return;
  const xml = await fetchText(sitemapUrl);
  if (!xml) return;

  let match = SITEMAP_INDEX_RE.exec(xml);
  while (match) {
    await crawlSitemapRecursive(match[1], found, depth + 1);
    match = SITEMAP_INDEX_RE.exec(xml);
  }

  SITEMAP_LOC_RE.lastIndex = 0;
  match = SITEMAP_LOC_RE.exec(xml);
  while (match) {
    try {
      const u = new URL(match[1]);
      if (u.protocol === "http:" || u.protocol === "https:") {
        found.add(u.toString());
      }
    } catch {
      /* skip invalid */
    }
    match = SITEMAP_LOC_RE.exec(xml);
  }
}

export function filterSameOrigin(urls: string[], base: string): string[] {
  const origin = new URL(base).origin;
  return urls.filter((u) => {
    try {
      return new URL(u).origin === origin;
    } catch {
      return false;
    }
  });
}
