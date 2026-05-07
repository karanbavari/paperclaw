import { z } from "zod";

export const marketplaceSkillTrustLevelSchema = z.enum([
  "markdown_only",
  "assets",
  "scripts_executables",
  "unknown",
]);

export const marketplaceSkillAssignModeSchema = z.enum([
  "library_only",
  "ceo",
  "all_agents",
  "selected_agents",
]);

export const marketplaceSkillCategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  skillCount: z.number().int().nonnegative(),
});

export const marketplaceSkillListItemSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable(),
  categorySlug: z.string().min(1),
  categoryName: z.string().min(1),
  sourceUrl: z.string().nullable(),
  installSource: z.string().nullable(),
  trustLevel: marketplaceSkillTrustLevelSchema,
  tags: z.array(z.string()).default([]),
  installedSkillId: z.string().uuid().nullable(),
});

export const marketplaceSkillDetailSchema = marketplaceSkillListItemSchema.extend({
  markdown: z.string().nullable(),
  installNotes: z.string().nullable(),
});

export const marketplaceSkillListResponseSchema = z.object({
  items: z.array(marketplaceSkillListItemSchema),
  nextCursor: z.string().nullable(),
});

export const marketplaceInstallSchema = z.object({
  skillId: z.string().min(1),
  assignMode: marketplaceSkillAssignModeSchema,
  agentIds: z.array(z.string().uuid()).optional(),
});

export type MarketplaceInstall = z.infer<typeof marketplaceInstallSchema>;
