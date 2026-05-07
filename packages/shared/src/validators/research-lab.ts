import { z } from "zod";
import {
  RESEARCH_LAB_STATUSES,
  RESEARCH_LAB_TYPES,
} from "../constants.js";

const nullableTrimmedString = z.preprocess(
  (value) => (typeof value === "string" && value.trim().length === 0 ? null : value),
  z.string().trim().nullable().optional(),
);

export const researchLabArtifactSchema = z.object({
  title: z.string().trim().min(1).max(180),
  url: nullableTrimmedString,
  kind: nullableTrimmedString,
  description: nullableTrimmedString,
});

export const createResearchLabSchema = z.object({
  title: z.string().trim().min(1).max(180),
  objective: z.string().trim().min(1).max(10_000),
  labType: z.enum(RESEARCH_LAB_TYPES).optional().default("research"),
  projectId: z.string().uuid().nullable().optional(),
  executionWorkspaceId: z.string().uuid().nullable().optional(),
  ownerAgentId: z.string().uuid().nullable().optional(),
  allowedAgentIds: z.array(z.string().uuid()).max(100).optional().default([]),
  demoUrls: z.array(z.string().trim().url()).max(20).optional().default([]),
  artifacts: z.array(researchLabArtifactSchema).max(50).optional().default([]),
  finalReport: nullableTrimmedString,
  metadata: z.record(z.unknown()).nullable().optional(),
});

export type CreateResearchLab = z.infer<typeof createResearchLabSchema>;

export const updateResearchLabSchema = createResearchLabSchema.partial().extend({
  status: z.enum(RESEARCH_LAB_STATUSES).optional(),
  decisionNote: nullableTrimmedString,
});

export type UpdateResearchLab = z.infer<typeof updateResearchLabSchema>;

export const researchLabSubmitSchema = z.object({
  note: nullableTrimmedString,
});

export type ResearchLabSubmit = z.infer<typeof researchLabSubmitSchema>;

export const researchLabDecisionSchema = z.object({
  decisionNote: nullableTrimmedString,
});

export type ResearchLabDecision = z.infer<typeof researchLabDecisionSchema>;
