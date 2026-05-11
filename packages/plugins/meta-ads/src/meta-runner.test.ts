import { describe, expect, it } from "vitest";
import {
  buildMetaCommand,
  buildRawMetaCommand,
  enforceBudgetGuards,
  ensurePlanAllowed,
  normalizeConfig,
} from "./meta-runner.js";

describe("meta ads runner", () => {
  it("builds structured Meta CLI args without shell strings", () => {
    const plan = buildMetaCommand({
      operation: "read",
      parts: ["campaigns", "list"],
      adAccountId: "act_123",
      params: { status: "ACTIVE", limit: 10 },
      summary: "list campaigns",
    });

    expect(plan.args).toEqual([
      "ads",
      "campaigns",
      "list",
      "--ad-account-id",
      "act_123",
      "--status",
      "ACTIVE",
      "--limit",
      "10",
    ]);
  });

  it("rejects unsafe raw command tokens", () => {
    expect(() => buildRawMetaCommand({
      args: ["ads", "campaigns", "list;rm -rf /"],
    })).toThrow("Unsafe raw argument");
  });

  it("blocks mutating payloads that exceed budget guardrails", () => {
    const config = normalizeConfig({ maxDailyBudgetCents: 1000, maxBudgetChangePercent: 10 });

    expect(() => enforceBudgetGuards(config, {
      dailyBudgetCents: 2500,
      budgetChangePercent: 15,
    })).toThrow("Meta Ads budget guard blocked");
  });

  it("enforces ad account allowlists", () => {
    const config = normalizeConfig({ allowedAdAccountIds: ["act_allowed"] });
    const plan = buildMetaCommand({
      operation: "read",
      parts: ["campaigns", "list"],
      adAccountId: "act_blocked",
      summary: "list campaigns",
    });

    expect(() => ensurePlanAllowed(config, plan)).toThrow("not allowed");
  });
});
