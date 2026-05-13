import { z } from "zod";
import {
  TOOL_PERMISSION_EFFECTS,
  TOOL_PERMISSION_SUBJECT_TYPES,
} from "../constants.js";

export const toolPermissionBudgetLimitSchema = z.object({
  amount: z.number().int().min(1),
  windowKind: z.literal("calendar_month_utc").default("calendar_month_utc"),
  metric: z.literal("execution_count").default("execution_count"),
});

export const upsertToolPermissionPolicySchema = z.object({
  id: z.string().uuid().optional(),
  subjectType: z.enum(TOOL_PERMISSION_SUBJECT_TYPES),
  subjectId: z.string().uuid().nullable().optional(),
  pluginKey: z.string().trim().min(1).max(200).nullable().optional(),
  toolName: z.string().trim().min(1).max(200).nullable().optional(),
  effect: z.enum(TOOL_PERMISSION_EFFECTS),
  budgetLimit: toolPermissionBudgetLimitSchema.nullable().optional(),
  enabled: z.boolean().optional().default(true),
}).superRefine((value, ctx) => {
  if (value.subjectType === "agent" && !value.subjectId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "agent policies require subjectId",
      path: ["subjectId"],
    });
  }
  if (value.subjectType === "company" && value.subjectId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "company policies must not include subjectId",
      path: ["subjectId"],
    });
  }
  if (value.effect !== "budget_limited" && value.budgetLimit) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "budgetLimit is only valid for budget_limited policies",
      path: ["budgetLimit"],
    });
  }
});

export const replaceToolPermissionPoliciesSchema = z.object({
  policies: z.array(upsertToolPermissionPolicySchema).max(500),
});

export const effectiveToolPermissionsQuerySchema = z.object({
  agentId: z.string().uuid().optional(),
  pluginKey: z.string().trim().min(1).optional(),
  toolName: z.string().trim().min(1).optional(),
});

export type UpsertToolPermissionPolicyInput = z.infer<typeof upsertToolPermissionPolicySchema>;
export type ReplaceToolPermissionPoliciesInput = z.infer<typeof replaceToolPermissionPoliciesSchema>;
export type EffectiveToolPermissionsQuery = z.infer<typeof effectiveToolPermissionsQuerySchema>;
