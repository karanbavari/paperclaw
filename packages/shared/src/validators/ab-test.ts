import { z } from "zod";

export const abAudienceSegmentSchema = z.object({
  name: z.string().trim().min(1).max(100),
  share: z.number().int().min(1).max(100),
  need: z.string().trim().min(1).max(500),
});

export const createAbStudySchema = z.object({
  projectId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  title: z.string().trim().min(1).max(180),
  description: z.string().trim().max(10_000).default(""),
  evidenceSummary: z.string().trim().max(20_000).nullable().optional(),
  marketContext: z.object({
    country: z.string().trim().max(100).optional(),
    currency: z.string().trim().length(3).optional(),
    productPrice: z.number().nonnegative().finite().optional(),
    pricePeriod: z.enum(["month", "year", "one_time"]).optional(),
  }).optional(),
});
export type CreateAbStudy = z.infer<typeof createAbStudySchema>;

export const updateAbStudySchema = z.object({
  description: z.string().trim().max(10_000).optional(),
  evidenceSummary: z.string().trim().max(20_000).nullable().optional(),
  marketContext: createAbStudySchema.shape.marketContext,
  audience: z.array(abAudienceSegmentSchema).min(1).max(8).optional(),
  variantA: z.string().trim().min(20).max(5_000).optional(),
  variantB: z.string().trim().min(20).max(5_000).optional(),
});
export type UpdateAbStudy = z.infer<typeof updateAbStudySchema>;

export const createAbRunSchema = z.object({ targetCount: z.number().int().min(10).max(1000).multipleOf(10).default(30) });
export type CreateAbRun = z.infer<typeof createAbRunSchema>;

export const approveAbRunSchema = z.object({
  agentId: z.string().uuid(),
  acknowledgeSynthetic: z.literal(true),
  acknowledgeCost: z.literal(true),
});
export type ApproveAbRun = z.infer<typeof approveAbRunSchema>;

export const abFeedbackQuerySchema = z.object({
  runId: z.string().uuid(),
  variant: z.enum(["A", "B"]).optional(),
  band: z.enum(["negative", "mixed", "positive"]).optional(),
  cursor: z.coerce.number().int().min(0).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});

export const abBatchOutputSchema = z.object({
  responses: z.array(z.object({
    ordinal: z.number().int().min(0).max(999),
    profile: z.object({
      name: z.string().trim().min(1).max(80),
      industry: z.string().trim().min(1).max(100),
      role: z.string().trim().min(1).max(120),
      city: z.string().trim().min(1).max(100),
      state: z.string().trim().min(1).max(100),
      country: z.string().trim().min(1).max(100),
      annualIncome: z.number().nonnegative().finite().nullable(),
      annualSalary: z.number().nonnegative().finite().nullable(),
      spendingLimit: z.number().nonnegative().finite().nullable(),
      spendingLimitPeriod: z.enum(["month", "year", "one_time"]).nullable(),
      currency: z.string().trim().length(3),
      dailyRoutine: z.array(z.string().trim().min(1).max(160)).min(2).max(4),
      assumptions: z.array(z.string().trim().min(1).max(160)).max(5),
      context: z.string().trim().min(1).max(500),
      concern: z.string().trim().min(1).max(500),
    }),
    rating: z.number().int().min(1).max(5),
    budgetFit: z.enum(["fit", "stretch", "not_fit", "unknown"]),
    workflowFit: z.enum(["fit", "partial", "not_fit", "unknown"]),
    rationale: z.string().trim().min(15).max(1_500),
    objection: z.string().trim().max(500).nullable(),
  })).min(1).max(25),
});
export type AbBatchOutput = z.infer<typeof abBatchOutputSchema>;

export const abDraftOutputSchema = z.object({
  audience: z.array(abAudienceSegmentSchema).min(2).max(8),
  variantA: z.string().trim().min(20).max(5_000),
  variantB: z.string().trim().min(20).max(5_000),
});
