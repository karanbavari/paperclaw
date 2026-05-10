import { z } from "zod";
import { createGoalSchema } from "./goal.js";
import { createIssueSchema } from "./issue.js";
import { createMeetingSchema } from "./meeting.js";
import { createResearchLabSchema } from "./research-lab.js";

export const DIRECT_CHAT_ACTION_KINDS = [
  "create_meeting",
  "create_issue",
  "create_goal",
  "create_research_lab",
] as const;

const directChatApprovalSourceSchema = z.object({
  directChatThreadId: z.string().uuid(),
  directChatMessageId: z.string().uuid().optional().nullable(),
  transcriptExcerpt: z.string().trim().max(12_000).optional().nullable(),
}).strict();

const directChatActionBaseSchema = z.object({
  title: z.string().trim().min(1).max(180),
  summary: z.string().trim().min(1).max(4_000),
  rationale: z.string().trim().max(4_000).optional().nullable(),
  recommendedAction: z.string().trim().max(2_000).optional().nullable(),
  nextActionOnApproval: z.string().trim().max(2_000).optional().nullable(),
  risks: z.array(z.string().trim().min(1).max(500)).max(20).optional().default([]),
  source: directChatApprovalSourceSchema,
});

const directChatActionProposalSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("create_meeting"),
    input: createMeetingSchema,
  }).strict(),
  z.object({
    kind: z.literal("create_issue"),
    input: createIssueSchema,
  }).strict(),
  z.object({
    kind: z.literal("create_goal"),
    input: createGoalSchema,
  }).strict(),
  z.object({
    kind: z.literal("create_research_lab"),
    input: createResearchLabSchema,
  }).strict(),
]);

export const directChatActionApprovalPayloadSchema = directChatActionBaseSchema.extend({
  action: directChatActionProposalSchema,
  appliedAction: z.object({
    entityType: z.enum(["meeting", "issue", "goal", "research_lab"]),
    entityId: z.string().uuid(),
    label: z.string().trim().min(1).max(240),
    href: z.string().trim().min(1).max(500),
    appliedAt: z.string().datetime(),
  }).strict().optional(),
}).passthrough();

export type DirectChatActionKind = (typeof DIRECT_CHAT_ACTION_KINDS)[number];
export type DirectChatActionApprovalPayload = z.infer<typeof directChatActionApprovalPayloadSchema>;
