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

export const marketplacePluginSourceTypeSchema = z.enum(["bundled", "npm"]);

export const marketplacePluginCategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  pluginCount: z.number().int().nonnegative(),
});

export const marketplacePluginListItemSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable(),
  categorySlug: z.string().min(1),
  categoryName: z.string().min(1),
  packageName: z.string().min(1),
  version: z.string().nullable(),
  sourceType: marketplacePluginSourceTypeSchema,
  localPath: z.string().nullable(),
  tags: z.array(z.string()).default([]),
  capabilities: z.array(z.string()).default([]),
  toolCount: z.number().int().nonnegative(),
  uiSlotCount: z.number().int().nonnegative(),
  jobCount: z.number().int().nonnegative(),
  webhookCount: z.number().int().nonnegative(),
  installedPluginId: z.string().uuid().nullable(),
  installedStatus: z.string().nullable(),
});

export const marketplacePluginDetailSchema = marketplacePluginListItemSchema.extend({
  markdown: z.string().nullable(),
  installNotes: z.string().nullable(),
});

export const marketplacePluginListResponseSchema = z.object({
  items: z.array(marketplacePluginListItemSchema),
  nextCursor: z.string().nullable(),
});

export const marketplaceCapabilityPackChecklistStatusSchema = z.enum(["done", "needs_action", "failed"]);

export const marketplaceCapabilityPackCategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  packCount: z.number().int().nonnegative(),
});

export const marketplaceCapabilityPackComponentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  installedId: z.string().uuid().nullable(),
  status: z.string().nullable(),
});

export const marketplaceCapabilityPackChecklistItemSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  status: marketplaceCapabilityPackChecklistStatusSchema,
  required: z.boolean(),
  href: z.string().nullable(),
});

export const marketplaceCapabilityPackListItemSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable(),
  categorySlug: z.string().min(1),
  categoryName: z.string().min(1),
  tags: z.array(z.string()).default([]),
  plugin: marketplaceCapabilityPackComponentSchema.nullable(),
  skills: z.array(marketplaceCapabilityPackComponentSchema).default([]),
  defaultAssignMode: marketplaceSkillAssignModeSchema,
  installed: z.boolean(),
  needsSetup: z.boolean(),
});

export const marketplaceCapabilityPackDetailSchema = marketplaceCapabilityPackListItemSchema.extend({
  markdown: z.string().nullable(),
  installNotes: z.string().nullable(),
  checklist: z.array(marketplaceCapabilityPackChecklistItemSchema).default([]),
});

export const marketplaceCapabilityPackListResponseSchema = z.object({
  items: z.array(marketplaceCapabilityPackListItemSchema),
  nextCursor: z.string().nullable(),
});

export const marketplaceInstallSchema = z.object({
  skillId: z.string().min(1),
  assignMode: marketplaceSkillAssignModeSchema,
  agentIds: z.array(z.string().uuid()).optional(),
});

export const marketplacePluginInstallSchema = z.object({
  pluginId: z.string().min(1),
});

export const marketplaceCapabilityPackInstallSchema = z.object({
  packId: z.string().min(1),
  assignMode: marketplaceSkillAssignModeSchema,
  agentIds: z.array(z.string().uuid()).optional(),
});

export type MarketplaceInstall = z.infer<typeof marketplaceInstallSchema>;
export type MarketplacePluginInstall = z.infer<typeof marketplacePluginInstallSchema>;
export type MarketplaceCapabilityPackInstall = z.infer<typeof marketplaceCapabilityPackInstallSchema>;
