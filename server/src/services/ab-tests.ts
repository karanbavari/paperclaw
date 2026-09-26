import { createHash } from "node:crypto";
import path from "node:path";
import { and, asc, desc, eq, gt, gte, inArray, lte, sql } from "drizzle-orm";
import type { Db } from "@kesarcloud/db";
import { abBatches, abFeedback, abPersonas, abRuns, abStudies, agents, heartbeatRuns, projects, projectWorkspaces } from "@kesarcloud/db";
import { AB_SUPPORTED_ADAPTER_TYPES, type AbAudienceSegment, type AbFeedbackPage, type AbRunSummary, type AbStudyDetail, type CreateAbStudy, type UpdateAbStudy } from "@kesarcloud/shared";
import { badRequest, conflict, notFound, unprocessable } from "../errors.js";
import { budgetService } from "./budgets.js";
import { logActivity } from "./activity-log.js";
import { AB_BATCH_SIZE, buildPersonaSlots, parseBatchOutput, parseDraftOutput, ratingBand } from "./ab-test-utils.js";
import { auditAbWorkspace } from "./ab-test-audit.js";

type Wakeup = (agentId: string, options: {
  source: "on_demand";
  triggerDetail: "system";
  reason: string;
  idempotencyKey: string;
  requestedByActorType: "system";
  contextSnapshot: Record<string, unknown>;
}) => Promise<{ id: string } | null | undefined>;

const TERMINAL_RUN_STATUSES = new Set(["succeeded", "failed", "cancelled", "timed_out"]);
const SUPPORTED_ADAPTERS = new Set<string>(AB_SUPPORTED_ADAPTER_TYPES);

function sha256(text: string) { return createHash("sha256").update(text).digest("hex"); }

function budgetFitFor(profile: Record<string, unknown>,
  market: { productPrice?: number; currency?: string; pricePeriod?: string } | null | undefined) {
  if (market?.productPrice == null || !market.currency || !market.pricePeriod || typeof profile.spendingLimit !== "number"
    || !Number.isFinite(profile.spendingLimit)
    || profile.currency !== market.currency || profile.spendingLimitPeriod !== market.pricePeriod) return "unknown" as const;
  if (market.productPrice <= profile.spendingLimit) return "fit" as const;
  if (market.productPrice <= profile.spendingLimit * 1.2) return "stretch" as const;
  return "not_fit" as const;
}

function suggestAudience(description: string): AbAudienceSegment[] {
  const business = /team|business|company|enterprise|saas|b2b/i.test(description);
  return business
    ? [
        { name: "Small-team decision makers", share: 30, need: "Clear value for a constrained budget" },
        { name: "Daily operators", share: 30, need: "A faster, more reliable workflow" },
        { name: "Skeptical evaluators", share: 20, need: "Evidence before adopting a new tool" },
        { name: "Growing-team leads", share: 20, need: "Scale without adding complexity" },
      ]
    : [
        { name: "Early adopters", share: 30, need: "A new way to solve the problem" },
        { name: "Practical buyers", share: 30, need: "Simple everyday value" },
        { name: "Skeptical prospects", share: 20, need: "Proof that the offer is worthwhile" },
        { name: "Occasional users", share: 20, need: "Low-friction first use" },
      ];
}

function sourceHash(input: { sourceSummary: string; description: string; evidenceSummary: string | null; audience: AbAudienceSegment[]; variantA: string; variantB: string; marketContext?: unknown }) {
  return sha256(JSON.stringify(input));
}

export function abTestService(db: Db, wakeup?: Wakeup, stopHeartbeat?: (runId: string, reason: string) => Promise<unknown>) {
  let ticking = false;
  async function study(companyId: string, studyId: string) {
    const row = await db.select().from(abStudies).where(and(eq(abStudies.companyId, companyId), eq(abStudies.id, studyId))).then((rows) => rows[0]);
    if (!row) throw notFound("A/B study not found");
    return row;
  }

  async function workspace(companyId: string, projectId: string, workspaceId: string) {
    const [project] = await db.select().from(projects).where(and(eq(projects.companyId, companyId), eq(projects.id, projectId))).limit(1);
    if (!project) throw notFound("Project not found");
    const [selected] = await db.select().from(projectWorkspaces).where(and(
      eq(projectWorkspaces.companyId, companyId), eq(projectWorkspaces.projectId, projectId), eq(projectWorkspaces.id, workspaceId),
    )).limit(1);
    if (!selected?.cwd || !path.isAbsolute(selected.cwd) || !["local_path", "non_git_path", "git_repo"].includes(selected.sourceType)) {
      throw unprocessable("Select an accessible registered local project workspace");
    }
    return { project, selected };
  }

  function summarizeRun(run: typeof abRuns.$inferSelect, grouped: Array<{ runId: string; variant: string; rating: number; count: number }>): AbRunSummary {
    const ratings = { A: [0, 0, 0, 0, 0, 0], B: [0, 0, 0, 0, 0, 0] };
    const counts = {
      A: { negative: 0, mixed: 0, positive: 0 },
      B: { negative: 0, mixed: 0, positive: 0 },
    };
    for (const item of grouped) {
      if (item.runId !== run.id) continue;
      if (item.variant !== "A" && item.variant !== "B") continue;
      ratings[item.variant][item.rating] = item.count;
      counts[item.variant][ratingBand(item.rating)] += item.count;
    }
    const scenario = (ratingCounts: number[]) => {
      const denominator = ratingCounts.reduce((sum, count) => sum + count, 0) || 1;
      return { low: Math.round(ratingCounts[5]! / denominator * 1_000),
        base: Math.round((ratingCounts[4]! + ratingCounts[5]!) / denominator * 1_000),
        high: Math.round((ratingCounts[3]! + ratingCounts[4]! + ratingCounts[5]!) / denominator * 1_000) };
    };
    return { run: run as AbRunSummary["run"], counts, scenarios: { A: scenario(ratings.A), B: scenario(ratings.B) } };
  }

  async function getDetail(companyId: string, studyId: string): Promise<AbStudyDetail> {
    const selected = await study(companyId, studyId);
    const runs = await db.select().from(abRuns).where(and(eq(abRuns.companyId, companyId), eq(abRuns.studyId, studyId)))
      .orderBy(desc(abRuns.createdAt));
    const grouped = await db.select({ runId: abFeedback.runId, variant: abFeedback.variant, rating: abFeedback.rating,
      count: sql<number>`count(*)::int` }).from(abFeedback)
      .where(and(eq(abFeedback.companyId, companyId), eq(abFeedback.studyId, studyId)))
      .groupBy(abFeedback.runId, abFeedback.variant, abFeedback.rating);
    const [{ count: personaCount }] = await db.select({ count: sql<number>`count(*)::int` }).from(abPersonas)
      .where(and(eq(abPersonas.companyId, companyId), eq(abPersonas.studyId, studyId)));
    return { study: selected as AbStudyDetail["study"], runs: runs.map((run) => summarizeRun(run, grouped)), personaCount: personaCount ?? 0 };
  }

  async function requestRun(companyId: string, studyId: string, requestedByUserId: string | null, targetCount = 30) {
    const selected = await study(companyId, studyId);
    if (selected.status === "archived") throw conflict("Archived studies cannot be run");
    if (selected.draftStatus === "generating") throw conflict("Wait for the audience preview, or save the starter draft first");
    if (!Number.isInteger(targetCount) || targetCount < 10 || targetCount > 1000 || targetCount % 10 !== 0) throw badRequest("Choose 10 to 1,000 personas in steps of 10");
    const existing = await db.select().from(abRuns).where(and(
      eq(abRuns.companyId, companyId), eq(abRuns.studyId, studyId),
      inArray(abRuns.status, ["pending_approval", "queued", "running"]),
    )).limit(1).then((rows) => rows[0]);
    if (existing) return existing;
    const [run] = await db.insert(abRuns).values({
      companyId, studyId, agentId: selected.agentId, sourceHash: selected.sourceHash, targetCount, outputVersion: 2,
      variantA: selected.variantA, variantB: selected.variantB, requestedByUserId,
    }).returning();
    return run!;
  }

  async function ensurePersonas(companyId: string, selected: typeof abStudies.$inferSelect, targetCount: number) {
    const slots = buildPersonaSlots(selected.id, selected.audience, targetCount);
    for (let index = 0; index < slots.length; index += 100) {
      await db.insert(abPersonas).values(slots.slice(index, index + 100).map((slot) => ({ ...slot, companyId, studyId: selected.id })))
        .onConflictDoNothing();
    }
  }

  async function approveRun(companyId: string, studyId: string, runId: string, agentId: string, approvedByUserId: string | null) {
    const selected = await study(companyId, studyId);
    const [run] = await db.select().from(abRuns).where(and(eq(abRuns.companyId, companyId), eq(abRuns.studyId, studyId), eq(abRuns.id, runId))).limit(1);
    if (!run) throw notFound("A/B run not found");
    if (run.status !== "pending_approval") throw conflict("Run is not pending approval");
    const [agent] = await db.select().from(agents).where(and(eq(agents.companyId, companyId), eq(agents.id, agentId))).limit(1);
    if (!agent || ["paused", "terminated", "pending_approval"].includes(agent.status)) throw unprocessable("Select an active company agent");
    if (!SUPPORTED_ADAPTERS.has(agent.adapterType)) throw unprocessable("Select a CLI agent that supports the A/B study prompt");
    const block = await budgetService(db).getInvocationBlock(companyId, agentId, { projectId: selected.projectId });
    if (block) throw conflict(block.reason);
    if (!wakeup) throw conflict("A/B execution is unavailable");
    await ensurePersonas(companyId, selected, run.targetCount);
    const batches = Array.from({ length: Math.ceil(run.targetCount / AB_BATCH_SIZE) }, (_, batchIndex) => ({
      companyId, runId, batchIndex, startOrdinal: batchIndex * AB_BATCH_SIZE,
      endOrdinal: Math.min(run.targetCount, (batchIndex + 1) * AB_BATCH_SIZE) - 1,
    }));
    await db.insert(abBatches).values(batches).onConflictDoNothing();
    const now = new Date();
    const [updated] = await db.update(abRuns).set({ status: "queued", outputVersion: 2, agentId, approvedByUserId, approvedAt: now, startedAt: now, updatedAt: now })
      .where(and(eq(abRuns.companyId, companyId), eq(abRuns.id, runId), eq(abRuns.status, "pending_approval"))).returning();
    if (!updated) throw conflict("Run was approved by another request");
    await db.update(abStudies).set({ agentId, status: "active", updatedAt: now }).where(eq(abStudies.id, studyId));
    return updated;
  }

  async function getFeedback(companyId: string, studyId: string, query: {
    runId: string; variant?: "A" | "B"; band?: "negative" | "mixed" | "positive"; cursor?: number; limit: number;
  }): Promise<AbFeedbackPage> {
    await study(companyId, studyId);
    const [run] = await db.select({ id: abRuns.id }).from(abRuns).where(and(eq(abRuns.companyId, companyId), eq(abRuns.studyId, studyId), eq(abRuns.id, query.runId))).limit(1);
    if (!run) throw notFound("A/B run not found");
    const ratingCondition = query.band === "negative" ? inArray(abFeedback.rating, [1, 2])
      : query.band === "mixed" ? eq(abFeedback.rating, 3)
        : query.band === "positive" ? inArray(abFeedback.rating, [4, 5]) : undefined;
    const rows = await db.select({ feedback: abFeedback, persona: abPersonas }).from(abFeedback)
      .innerJoin(abPersonas, eq(abFeedback.personaId, abPersonas.id))
      .where(and(eq(abFeedback.companyId, companyId), eq(abFeedback.studyId, studyId), eq(abFeedback.runId, query.runId),
        query.variant ? eq(abFeedback.variant, query.variant) : undefined,
        ratingCondition,
        query.cursor === undefined ? undefined : gt(abPersonas.ordinal, query.cursor),
      )).orderBy(asc(abPersonas.ordinal)).limit(query.limit + 1);
    const hasMore = rows.length > query.limit;
    const page = rows.slice(0, query.limit);
    return {
      items: page.map(({ feedback, persona }) => ({
        id: feedback.id, personaId: persona.id, ordinal: persona.ordinal, segment: persona.segment,
        profile: persona.profile, variant: feedback.variant as "A" | "B", rating: feedback.rating,
        budgetFit: feedback.budgetFit as AbFeedbackPage["items"][number]["budgetFit"],
        workflowFit: feedback.workflowFit as AbFeedbackPage["items"][number]["workflowFit"],
        rationale: feedback.rationale, objection: feedback.objection, createdAt: feedback.createdAt,
      })),
      nextCursor: hasMore ? page.at(-1)!.persona.ordinal : null,
    };
  }

  async function dispatchBatch(run: typeof abRuns.$inferSelect, selected: typeof abStudies.$inferSelect, batch: typeof abBatches.$inferSelect) {
    if (!run.agentId || !wakeup) return;
    const block = await budgetService(db).getInvocationBlock(run.companyId, run.agentId, { projectId: selected.projectId });
    if (block) {
      await db.update(abRuns).set({ status: "failed", error: block.reason, finishedAt: new Date(), updatedAt: new Date() }).where(eq(abRuns.id, run.id));
      return;
    }
    const personas = await db.select().from(abPersonas).where(and(eq(abPersonas.companyId, run.companyId), eq(abPersonas.studyId, run.studyId),
      gte(abPersonas.ordinal, batch.startOrdinal), lte(abPersonas.ordinal, batch.endOrdinal)))
      .orderBy(asc(abPersonas.ordinal));
    const assigned = personas;
    const [claimed] = await db.update(abBatches).set({ status: "dispatching", attempts: batch.attempts + 1, updatedAt: new Date() })
      .where(and(eq(abBatches.id, batch.id), eq(abBatches.status, "queued"))).returning();
    if (!claimed) return;
    try {
      const wakeRun = await wakeup(run.agentId, {
        source: "on_demand", triggerDetail: "system", reason: "ab_test_batch",
        idempotencyKey: `ab-test:${run.id}:${batch.batchIndex}:${claimed.attempts}`,
        requestedByActorType: "system",
        contextSnapshot: {
          taskKey: `ab-test:${run.id}:${batch.batchIndex}`,
          forceFreshSession: true,
          paperclawAbTest: {
            studyId: selected.id, runId: run.id, batchId: batch.id,
            productDescription: selected.description.slice(0, 1_200),
            sourceSummary: selected.sourceSummary.slice(0, 2_000),
            audience: selected.audience,
            evidenceSummary: selected.evidenceSummary?.slice(0, 1_500) ?? null,
            marketContext: selected.marketContext,
            variantA: run.variantA, variantB: run.variantB,
            personas: assigned.map((persona) => ({ ordinal: persona.ordinal, segment: persona.segment,
              variant: persona.assignedVariant, profile: persona.profile })),
          },
        },
      });
      if (!wakeRun?.id) throw new Error("Agent wakeup was skipped");
      await db.update(abBatches).set({ status: "running", heartbeatRunId: wakeRun.id, updatedAt: new Date() }).where(eq(abBatches.id, batch.id));
      await db.update(abRuns).set({ status: "running", updatedAt: new Date() }).where(eq(abRuns.id, run.id));
    } catch (error) {
      await db.update(abBatches).set({ status: claimed.attempts >= 3 ? "failed" : "queued", error: String(error), updatedAt: new Date() }).where(eq(abBatches.id, batch.id));
    }
  }

  async function reconcileBatch(run: typeof abRuns.$inferSelect, batch: typeof abBatches.$inferSelect) {
    if (!batch.heartbeatRunId) return;
    const [heartbeat] = await db.select().from(heartbeatRuns).where(and(eq(heartbeatRuns.companyId, run.companyId), eq(heartbeatRuns.id, batch.heartbeatRunId))).limit(1);
    if (!heartbeat || !TERMINAL_RUN_STATUSES.has(heartbeat.status)) return;
    if (heartbeat.status !== "succeeded") {
      await db.update(abBatches).set({ status: batch.attempts >= 3 ? "failed" : "queued", error: heartbeat.error ?? heartbeat.status, heartbeatRunId: null, updatedAt: new Date() }).where(eq(abBatches.id, batch.id));
      return;
    }
    try {
      const text = [heartbeat.resultJson?.summary, heartbeat.resultJson?.result, heartbeat.stdoutExcerpt]
        .find((value): value is string => typeof value === "string" && value.trim().length > 0) ?? "";
      const expected = Array.from({ length: batch.endOrdinal - batch.startOrdinal + 1 }, (_, index) => batch.startOrdinal + index);
      const output = parseBatchOutput(text, expected, run.outputVersion === 1);
      const [studyRow] = await db.select({ marketContext: abStudies.marketContext }).from(abStudies)
        .where(and(eq(abStudies.companyId, run.companyId), eq(abStudies.id, run.studyId))).limit(1);
      const personas = await db.select().from(abPersonas).where(and(eq(abPersonas.companyId, run.companyId), eq(abPersonas.studyId, run.studyId),
        gte(abPersonas.ordinal, batch.startOrdinal), lte(abPersonas.ordinal, batch.endOrdinal)));
      const byOrdinal = new Map(personas.map((persona) => [persona.ordinal, persona]));
      for (const response of output.responses) {
        const persona = byOrdinal.get(response.ordinal)!;
        const isNewProfile = persona.profile.concern === "Awaiting simulation";
        if (isNewProfile) {
          await db.update(abPersonas).set({ profile: response.profile }).where(eq(abPersonas.id, persona.id));
        }
        const profile = isNewProfile ? response.profile : persona.profile;
        await db.insert(abFeedback).values({ companyId: run.companyId, studyId: run.studyId, runId: run.id,
          personaId: persona.id, variant: persona.assignedVariant, rating: response.rating,
          budgetFit: budgetFitFor(profile, studyRow?.marketContext),
          workflowFit: response.workflowFit,
          rationale: response.rationale, objection: response.objection }).onConflictDoNothing();
      }
      await db.update(abBatches).set({ status: "completed", error: null, updatedAt: new Date() }).where(eq(abBatches.id, batch.id));
      await db.update(abRuns).set({ completedCount: run.completedCount + output.responses.length, updatedAt: new Date() }).where(eq(abRuns.id, run.id));
    } catch (error) {
      await db.update(abBatches).set({ status: batch.attempts >= 3 ? "failed" : "queued", heartbeatRunId: null, error: String(error), updatedAt: new Date() }).where(eq(abBatches.id, batch.id));
    }
  }

  async function reconcileRun(run: typeof abRuns.$inferSelect) {
    const [selected] = await db.select().from(abStudies).where(and(eq(abStudies.companyId, run.companyId), eq(abStudies.id, run.studyId))).limit(1);
    if (!selected) return;
    const batches = await db.select().from(abBatches).where(and(eq(abBatches.companyId, run.companyId), eq(abBatches.runId, run.id))).orderBy(asc(abBatches.batchIndex));
    const active = batches.find((batch) => batch.status === "running" || batch.status === "dispatching");
    if (active?.status === "running") {
      await reconcileBatch(run, active);
      const [latest] = await db.select({ status: abBatches.status }).from(abBatches).where(eq(abBatches.id, active.id)).limit(1);
      if (latest?.status === "completed") {
        const next = batches.find((batch) => batch.status === "queued");
        if (next) await dispatchBatch(run, selected, next);
      }
      return;
    }
    if (active?.status === "dispatching") {
      if (Date.now() - active.updatedAt.getTime() > 5 * 60_000) {
        await db.update(abBatches).set({ status: active.attempts >= 3 ? "failed" : "queued", updatedAt: new Date() }).where(eq(abBatches.id, active.id));
      }
      return;
    }
    if (batches.some((batch) => batch.status === "failed")) {
      await db.update(abRuns).set({ status: "failed", error: "One or more batches failed after three attempts", finishedAt: new Date(), updatedAt: new Date() }).where(eq(abRuns.id, run.id));
      return;
    }
    const next = batches.find((batch) => batch.status === "queued");
    if (next) { await dispatchBatch(run, selected, next); return; }
    if (batches.length === Math.ceil(run.targetCount / (run.outputVersion === 1 ? 25 : AB_BATCH_SIZE))) {
      await db.update(abRuns).set({ status: "completed", completedCount: run.targetCount, finishedAt: new Date(), updatedAt: new Date() }).where(eq(abRuns.id, run.id));
    }
  }

  async function reconcileDraft(selected: typeof abStudies.$inferSelect) {
    if (selected.draftStatus !== "generating" || !selected.draftHeartbeatRunId) return;
    const [heartbeat] = await db.select().from(heartbeatRuns).where(and(
      eq(heartbeatRuns.companyId, selected.companyId), eq(heartbeatRuns.id, selected.draftHeartbeatRunId),
    )).limit(1);
    if (!heartbeat || !TERMINAL_RUN_STATUSES.has(heartbeat.status)) return;
    try {
      if (heartbeat.status !== "succeeded") throw new Error(heartbeat.error ?? `Preview agent ${heartbeat.status}`);
      const text = [heartbeat.resultJson?.summary, heartbeat.resultJson?.result, heartbeat.stdoutExcerpt]
        .find((value): value is string => typeof value === "string" && value.trim().length > 0) ?? "";
      const draft = parseDraftOutput(text);
      await db.update(abStudies).set({ ...draft, draftStatus: "generated", draftError: null,
        sourceHash: sourceHash({ sourceSummary: selected.sourceSummary, description: selected.description,
          evidenceSummary: selected.evidenceSummary, marketContext: selected.marketContext, ...draft }), updatedAt: new Date() })
        .where(and(eq(abStudies.id, selected.id), eq(abStudies.draftStatus, "generating")));
    } catch (error) {
      await db.update(abStudies).set({ draftStatus: "failed", draftError: String(error), updatedAt: new Date() })
        .where(and(eq(abStudies.id, selected.id), eq(abStudies.draftStatus, "generating")));
    }
  }

  async function generatePreview(companyId: string, studyId: string) {
    const selected = await study(companyId, studyId);
    if (selected.status === "archived") throw conflict("Archived studies cannot generate a preview");
    if (selected.draftStatus === "generating") return selected;
    if (!wakeup) throw conflict("Audience preview is unavailable");
    const candidates = await db.select().from(agents).where(eq(agents.companyId, companyId));
    const agent = candidates.filter((candidate) => SUPPORTED_ADAPTERS.has(candidate.adapterType)
      && !["paused", "terminated", "pending_approval"].includes(candidate.status))
      .sort((a, b) => Number(/cmo|marketing/i.test(b.role + " " + b.name)) - Number(/cmo|marketing/i.test(a.role + " " + a.name)))[0];
    if (!agent) throw unprocessable("No active compatible CLI agent is available. You can edit the starter audience manually.");
    const block = await budgetService(db).getInvocationBlock(companyId, agent.id, { projectId: selected.projectId });
    if (block) throw conflict(block.reason);
    const preview = await wakeup(agent.id, {
      source: "on_demand", triggerDetail: "system", reason: "ab_test_preview",
      idempotencyKey: `ab-preview:${studyId}:${selected.sourceHash}`, requestedByActorType: "system",
      contextSnapshot: { taskKey: `ab-preview:${studyId}:${selected.sourceHash}`, forceFreshSession: true,
        paperclawAbDraft: { description: selected.description, sourceSummary: selected.sourceSummary.slice(0, 8_000),
          evidenceSummary: selected.evidenceSummary, marketContext: selected.marketContext } },
    });
    if (!preview?.id) throw conflict("Preview agent did not start");
    const [updated] = await db.update(abStudies).set({ agentId: agent.id, draftHeartbeatRunId: preview.id,
      draftStatus: "generating", draftError: null, updatedAt: new Date() })
      .where(and(eq(abStudies.companyId, companyId), eq(abStudies.id, studyId))).returning();
    return updated!;
  }

  return {
    list: (companyId: string) => db.select().from(abStudies).where(and(eq(abStudies.companyId, companyId), eq(abStudies.status, "draft")))
      .orderBy(desc(abStudies.updatedAt)),
    listAll: (companyId: string) => db.select().from(abStudies).where(and(eq(abStudies.companyId, companyId), inArray(abStudies.status, ["draft", "active"])))
      .orderBy(desc(abStudies.updatedAt)),
    getDetail,
    generatePreview,
    create: async (companyId: string, input: CreateAbStudy) => {
      const { selected } = await workspace(companyId, input.projectId, input.workspaceId);
      const snapshot = await auditAbWorkspace(selected.cwd!, input.description);
      const marketContext = input.marketContext ?? (snapshot.report.priceEvidence ? {
        productPrice: snapshot.report.priceEvidence.productPrice,
        currency: snapshot.report.priceEvidence.currency,
        pricePeriod: snapshot.report.priceEvidence.pricePeriod,
      } : null);
      const context = input.description.trim() || snapshot.report.summary;
      const audience = suggestAudience(`${context} ${snapshot.sourceSummary.slice(0, 2_000)}`);
      const variantA = context.slice(0, 400).padEnd(20, ".");
      const variantB = `For ${audience[0]!.name.toLowerCase()}: ${variantA}. Focus on ${audience[0]!.need.toLowerCase()}.`.slice(0, 500);
      const evidenceSummary = input.evidenceSummary ?? null;
      const [created] = await db.insert(abStudies).values({
        companyId, projectId: input.projectId, workspaceId: input.workspaceId, title: input.title,
        description: input.description, evidenceSummary, sourceSummary: snapshot.sourceSummary,
        auditReport: snapshot.report, marketContext,
        sourceHash: sourceHash({ sourceSummary: snapshot.sourceSummary, description: input.description, evidenceSummary,
          audience, variantA, variantB, marketContext }),
        audience, variantA, variantB,
      }).returning();
      return created!;
    },
    update: async (companyId: string, studyId: string, input: UpdateAbStudy) => {
      const selected = await study(companyId, studyId);
      if (selected.status === "archived") throw conflict("Archived studies cannot be edited");
      const approvedRuns = await db.select({ id: abRuns.id }).from(abRuns).where(and(eq(abRuns.companyId, companyId), eq(abRuns.studyId, studyId), inArray(abRuns.status, ["queued", "running", "completed"]))).limit(1);
      if (approvedRuns.length && input.audience) throw conflict("Audience is locked after the first approved run");
      const audience = input.audience ?? selected.audience;
      if (audience.reduce((sum, segment) => sum + segment.share, 0) !== 100) throw badRequest("Audience shares must total 100%");
      const variantA = input.variantA ?? selected.variantA;
      const variantB = input.variantB ?? selected.variantB;
      const description = input.description ?? selected.description;
      const evidenceSummary = input.evidenceSummary === undefined ? selected.evidenceSummary : input.evidenceSummary;
      const marketContext = input.marketContext === undefined ? selected.marketContext : input.marketContext;
      const [updated] = await db.update(abStudies).set({ audience, variantA, variantB, description, evidenceSummary, marketContext,
        draftStatus: selected.draftStatus === "generating" ? "starter" : selected.draftStatus,
        draftHeartbeatRunId: selected.draftStatus === "generating" ? null : selected.draftHeartbeatRunId,
        sourceHash: sourceHash({ sourceSummary: selected.sourceSummary, description,
          evidenceSummary, audience, variantA, variantB, marketContext }), updatedAt: new Date(),
      }).where(and(eq(abStudies.companyId, companyId), eq(abStudies.id, studyId))).returning();
      if (selected.draftStatus === "generating" && selected.draftHeartbeatRunId) {
        await stopHeartbeat?.(selected.draftHeartbeatRunId, "Operator kept an edited A/B preview").catch(() => undefined);
      }
      await db.update(abRuns).set({ variantA, variantB, sourceHash: updated!.sourceHash, updatedAt: new Date() })
        .where(and(eq(abRuns.companyId, companyId), eq(abRuns.studyId, studyId), eq(abRuns.status, "pending_approval")));
      return updated!;
    },
    requestRun,
    approveRun,
    getFeedback,
    listPersonas: async (companyId: string, studyId: string, cursor: number, limit: number) => {
      await study(companyId, studyId);
      const rows = await db.select().from(abPersonas).where(and(eq(abPersonas.companyId, companyId),
        eq(abPersonas.studyId, studyId), gt(abPersonas.ordinal, cursor),
        sql`coalesce(${abPersonas.profile}->>'concern', '') <> 'Awaiting simulation'`))
        .orderBy(asc(abPersonas.ordinal)).limit(limit + 1);
      return { items: rows.slice(0, limit), nextCursor: rows.length > limit ? rows[limit - 1]!.ordinal : null };
    },
    cancelRun: async (companyId: string, studyId: string, runId: string) => {
      await study(companyId, studyId);
      const [updated] = await db.update(abRuns).set({ status: "cancelled", finishedAt: new Date(), updatedAt: new Date() })
        .where(and(eq(abRuns.companyId, companyId), eq(abRuns.studyId, studyId), eq(abRuns.id, runId), inArray(abRuns.status, ["pending_approval", "queued", "running"]))).returning();
      if (!updated) throw conflict("Run is already finished");
      const runningBatches = await db.select({ heartbeatRunId: abBatches.heartbeatRunId }).from(abBatches)
        .where(and(eq(abBatches.companyId, companyId), eq(abBatches.runId, runId), eq(abBatches.status, "running")));
      for (const batch of runningBatches) {
        if (batch.heartbeatRunId) await stopHeartbeat?.(batch.heartbeatRunId, "A/B simulation cancelled by operator");
      }
      return updated;
    },
    archive: async (companyId: string, studyId: string) => {
      const selected = await study(companyId, studyId);
      if (selected.status === "archived") return selected;
      const active = await db.select({ id: abRuns.id }).from(abRuns).where(and(eq(abRuns.companyId, companyId),
        eq(abRuns.studyId, studyId), inArray(abRuns.status, ["pending_approval", "queued", "running"]))).limit(1);
      if (active.length) throw conflict("Cancel the active A/B run before archiving");
      if (selected.draftStatus === "generating" && selected.draftHeartbeatRunId) {
        await stopHeartbeat?.(selected.draftHeartbeatRunId, "A/B study archived").catch(() => undefined);
      }
      const [updated] = await db.update(abStudies).set({ status: "archived", updatedAt: new Date() })
        .where(and(eq(abStudies.companyId, companyId), eq(abStudies.id, studyId))).returning();
      return updated!;
    },
    tick: async () => {
      if (ticking) return;
      ticking = true;
      try {
      const drafts = await db.select().from(abStudies).where(eq(abStudies.draftStatus, "generating")).limit(25);
      for (const selected of drafts) await reconcileDraft(selected);
      const active = await db.select().from(abRuns).where(inArray(abRuns.status, ["queued", "running"]))
        .orderBy(asc(abRuns.createdAt)).limit(10);
      for (const run of active) await reconcileRun(run);
      const due = await db.select().from(abStudies).where(eq(abStudies.status, "active")).limit(50);
      const dailyErrors: string[] = [];
      for (const selected of due) {
        if (selected.lastCheckedAt && Date.now() - selected.lastCheckedAt.getTime() < 24 * 60 * 60_000) continue;
        const inProgress = await db.select({ id: abRuns.id }).from(abRuns).where(and(eq(abRuns.companyId, selected.companyId),
          eq(abRuns.studyId, selected.id), inArray(abRuns.status, ["queued", "running"]))).limit(1);
        if (inProgress.length) continue;
        try {
          const { selected: selectedWorkspace } = await workspace(selected.companyId, selected.projectId, selected.workspaceId);
          const snapshot = await auditAbWorkspace(selectedWorkspace.cwd!, selected.description);
          const nextHash = sourceHash({ sourceSummary: snapshot.sourceSummary, description: selected.description,
            evidenceSummary: selected.evidenceSummary, audience: selected.audience,
            variantA: selected.variantA, variantB: selected.variantB, marketContext: selected.marketContext });
          await db.update(abStudies).set({ lastCheckedAt: new Date(), ...(nextHash === selected.sourceHash ? {} : {
            sourceSummary: snapshot.sourceSummary, auditReport: snapshot.report, sourceHash: nextHash, updatedAt: new Date(),
          }) }).where(eq(abStudies.id, selected.id));
          if (nextHash !== selected.sourceHash) {
            const [lastRun] = await db.select({ targetCount: abRuns.targetCount }).from(abRuns)
              .where(and(eq(abRuns.companyId, selected.companyId), eq(abRuns.studyId, selected.id)))
              .orderBy(desc(abRuns.createdAt)).limit(1);
            const pending = await requestRun(selected.companyId, selected.id, null, lastRun?.targetCount ?? 30);
            await db.update(abRuns).set({ sourceHash: nextHash, updatedAt: new Date() })
              .where(and(eq(abRuns.id, pending.id), eq(abRuns.status, "pending_approval")));
            await logActivity(db, { companyId: selected.companyId, actorType: "system", actorId: "ab_test_daily_check",
              action: "ab_run.source_changed", entityType: "ab_study", entityId: selected.id,
              details: { runId: pending.id, sourceHash: nextHash } });
          }
        } catch (error) { dailyErrors.push(`${selected.id}: ${String(error)}`); }
      }
      if (dailyErrors.length) throw new Error(`A/B daily checks failed: ${dailyErrors.join("; ")}`);
      } finally { ticking = false; }
    },
  };
}
