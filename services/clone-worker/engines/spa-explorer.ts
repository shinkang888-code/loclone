import type { Page } from "playwright";
import { crawlSite } from "./site-crawler.js";
import type { CloneOptions, CloneResult } from "../types.js";

/** websnap-inspired: limited state exploration via link discovery */
export async function exploreSpaStates(
  page: Page,
  url: string,
  options: CloneOptions,
): Promise<CloneResult> {
  return crawlSite(page, url, "spa-states", {
    ...options,
    maxDepth: options.maxDepth ?? 3,
    maxPages: options.maxPages ?? 15,
  });
}
