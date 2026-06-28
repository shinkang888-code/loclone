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

export const cloneRequestSchema = z.object({
  url: z.string().min(1),
});

export const siteCreateSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  projectId: z.string().optional().nullable(),
});
