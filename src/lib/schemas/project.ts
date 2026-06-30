import { z } from "zod";

export const projectCreateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  targetUrls: z.array(z.string().url()).default([]),
  fidelity: z.enum(["pixel-perfect", "balanced", "fast"]).default("pixel-perfect"),
});

export const projectUpdateSchema = projectCreateSchema.partial().extend({
  status: z.enum(["draft", "active", "archived"]).optional(),
});

const cloneModeSchema = z.enum([
  "static",
  "render",
  "full",
  "mirror",
  "spa-states",
  "agent-pixel",
]);

const cloneOptionsSchema = z
  .object({
    maxDepth: z.number().int().min(0).max(10).optional(),
    maxPages: z.number().int().min(1).max(500).optional(),
    sameOriginOnly: z.boolean().optional(),
    seedSitemaps: z.boolean().optional(),
    browser: z.enum(["playwright", "puppeteer"]).optional(),
    scraperBackend: z.enum(["local", "crawl4ai", "firecrawl"]).optional(),
    headless: z.boolean().optional(),
  })
  .optional();

export const cloneRequestSchema = z.object({
  url: z.string().min(1),
  mode: cloneModeSchema.default("static"),
  options: cloneOptionsSchema,
});

export const siteCreateSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  projectId: z.string().optional().nullable(),
});
