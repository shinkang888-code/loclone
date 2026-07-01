import { extractSiteData } from "@/lib/clone/extract";
import { saveCloneArtifacts } from "@/lib/clone/artifacts";
import { appendRunLog } from "@/lib/clone/logs";
import {
  firecrawlCrawl,
  firecrawlScrape,
  isFirecrawlConfigured,
  pageDescription,
  pageHtml,
  pageOgImage,
  pageTitle,
  pageUrl,
} from "@/lib/clone/firecrawl-client";
import type { CloneMode, CloneOptions, CloneResult } from "@/types/clone";

function pickPrimaryPage(
  pages: Array<{ html: string; finalUrl: string }>,
  startUrl: string,
): { html: string; finalUrl: string } {
  const startOrigin = new URL(startUrl).origin;
  const exact = pages.find((p) => p.finalUrl === startUrl || p.finalUrl === `${startUrl}/`);
  if (exact) return exact;
  const sameOrigin = pages.find((p) => {
    try {
      return new URL(p.finalUrl).origin === startOrigin;
    } catch {
      return false;
    }
  });
  return sameOrigin ?? pages[0]!;
}

export async function runFirecrawlClone(
  targetUrl: string,
  mode: CloneMode,
  options: CloneOptions,
  locloneRunId: string,
): Promise<{ result: CloneResult }> {
  if (!isFirecrawlConfigured()) {
    throw new Error(
      "FIRECRAWL_API_KEY가 필요합니다. Vercel 환경 변수에 설정하거나 /dashboard/waiting 을 확인하세요.",
    );
  }

  const useCrawl = mode === "mirror" || mode === "full" || mode === "spa-states";

  if (useCrawl) {
    await appendRunLog(locloneRunId, `firecrawl: crawl 시작 mode=${mode}`);
    const pages = await firecrawlCrawl(targetUrl, options, mode);
    await appendRunLog(locloneRunId, `firecrawl: ${pages.length}페이지 수집`);

    const mapped = pages
      .map((p) => {
        const html = pageHtml(p);
        if (!html) return null;
        const finalUrl = pageUrl(p, targetUrl);
        return { html, finalUrl };
      })
      .filter((p): p is { html: string; finalUrl: string } => Boolean(p));

    if (mapped.length === 0) {
      throw new Error("Firecrawl crawl 결과 HTML이 비어 있습니다.");
    }

    const primary = pickPrimaryPage(mapped, targetUrl);
    const extracted = extractSiteData(primary.html, targetUrl, primary.finalUrl);
    const result = await saveCloneArtifacts(targetUrl, {
      ...extracted,
      html: primary.html,
    });

    return {
      result: {
        ...result,
        pagesCrawled: mapped.length,
        metadataJson: {
          ...(result.metadataJson ?? {}),
          runtime: "firecrawl+crawl",
          pagesCrawled: mapped.length,
        },
      },
    };
  }

  await appendRunLog(locloneRunId, "firecrawl: scrape 시작");
  const page = await firecrawlScrape(targetUrl, options);
  const html = pageHtml(page);
  if (!html) {
    throw new Error("Firecrawl scrape 결과 HTML이 비어 있습니다.");
  }

  const finalUrl = pageUrl(page, targetUrl);
  await appendRunLog(locloneRunId, `firecrawl: 완료 title=${pageTitle(page)}`);

  const extracted = extractSiteData(html, targetUrl, finalUrl);
  const result = await saveCloneArtifacts(targetUrl, {
    ...extracted,
    title: pageTitle(page) || extracted.title,
    description: pageDescription(page) ?? extracted.description,
    ogImage: pageOgImage(page) ?? extracted.ogImage,
    html,
  });

  return {
    result: {
      ...result,
      pagesCrawled: 1,
      metadataJson: {
        ...(result.metadataJson ?? {}),
        runtime: "firecrawl+scrape",
        pagesCrawled: 1,
      },
    },
  };
}
