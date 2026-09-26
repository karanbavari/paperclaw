export type AbVariant = "A" | "B";
/** Adapters that render the shared wake-payload prompt used by synthetic studies. */
export const AB_SUPPORTED_ADAPTER_TYPES = [
  "acpx_local", "claude_local", "codex_local", "cursor", "cursor_cloud", "gemini_local",
  "grok_local", "hermes_local", "kimi_local", "openclaw_gateway", "opencode_local", "pi_local",
] as const;
export type AbRatingBand = "negative" | "mixed" | "positive";
export type AbRunStatus = "pending_approval" | "queued" | "running" | "completed" | "failed" | "cancelled";

export interface AbAudienceSegment {
  name: string;
  share: number;
  need: string;
}

export interface AbStudy {
  id: string;
  companyId: string;
  projectId: string;
  workspaceId: string;
  agentId: string | null;
  title: string;
  description: string;
  evidenceSummary: string | null;
  sourceSummary: string;
  sourceHash: string;
  auditReport: { summary: string; files: string[]; warnings: string[]; priceEvidence?: { productPrice: number; currency: string; pricePeriod: "month" | "year" | "one_time"; sourcePath: string } } | null;
  marketContext: { country?: string; currency?: string; productPrice?: number; pricePeriod?: "month" | "year" | "one_time" } | null;
  draftHeartbeatRunId: string | null;
  draftStatus: "starter" | "generating" | "generated" | "failed";
  draftError: string | null;
  audience: AbAudienceSegment[];
  variantA: string;
  variantB: string;
  status: "draft" | "active" | "archived";
  lastCheckedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AbRun {
  id: string;
  companyId: string;
  studyId: string;
  agentId: string | null;
  status: AbRunStatus;
  targetCount: number;
  outputVersion: number;
  sourceHash: string;
  variantA: string;
  variantB: string;
  completedCount: number;
  error: string | null;
  requestedByUserId: string | null;
  approvedByUserId: string | null;
  approvedAt: Date | null;
  startedAt: Date | null;
  finishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AbFeedback {
  id: string;
  personaId: string;
  ordinal: number;
  segment: string;
  profile: Record<string, unknown>;
  variant: AbVariant;
  rating: number;
  budgetFit: "fit" | "stretch" | "not_fit" | "unknown";
  workflowFit: "fit" | "partial" | "not_fit" | "unknown";
  rationale: string;
  objection: string | null;
  createdAt: Date;
}

export interface AbFeedbackPage {
  items: AbFeedback[];
  nextCursor: number | null;
}

export interface AbRunSummary {
  run: AbRun;
  counts: Record<AbVariant, Record<AbRatingBand, number>>;
  /** Illustrative favourable responses per 1,000 simulated exposures; not a real-user forecast. */
  scenarios: Record<AbVariant, { low: number; base: number; high: number }>;
}

export interface AbStudyDetail {
  study: AbStudy;
  runs: AbRunSummary[];
  personaCount: number;
}
