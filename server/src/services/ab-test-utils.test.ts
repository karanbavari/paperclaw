import { describe, expect, it } from "vitest";
import { renderPaperclipWakePrompt } from "@kesarcloud/adapter-utils/server-utils";
import { buildPersonaSlots, parseBatchOutput, parseDraftOutput, renderAbDraftPrompt, renderAbTestPrompt, scenarioFromRatings } from "./ab-test-utils.js";

describe("synthetic A/B study utilities", () => {
  it("creates a stable 500/500 split with exact audience size", () => {
    const audience = [
      { name: "Founders", share: 60, need: "Growth" },
      { name: "Operators", share: 40, need: "Less manual work" },
    ];
    const first = buildPersonaSlots("study-1", audience);
    expect(first).toHaveLength(1_000);
    expect(first.filter((persona) => persona.assignedVariant === "A")).toHaveLength(500);
    expect(first.filter((persona) => persona.segment === "Founders")).toHaveLength(600);
    expect(buildPersonaSlots("study-1", audience)).toEqual(first);
    for (const count of [10, 30, 1000]) {
      const slots = buildPersonaSlots("study-1", audience, count);
      expect(slots).toHaveLength(count);
      expect(slots.filter((persona) => persona.assignedVariant === "A")).toHaveLength(count / 2);
      expect(buildPersonaSlots("study-1", audience, count)).toEqual(slots);
    }
  });

  it("uses transparent strict/base/broad rating thresholds, not conversion forecasts", () => {
    expect(scenarioFromRatings([1, 2, 3, 4, 5])).toEqual({ low: 200, base: 400, high: 600 });
  });

  it("rejects missing and duplicate ordinal output", () => {
    const response = (ordinal: number) => ({ ordinal, profile: { name: "Alex", industry: "Software", role: "Founder", city: "Austin", state: "Texas", country: "United States", annualIncome: null, annualSalary: null, spendingLimit: null, spendingLimitPeriod: null, currency: "USD", dailyRoutine: ["Review plans", "Talk to users"], assumptions: ["Location is synthetic"], context: "Small company", concern: "Budget" }, rating: 3, budgetFit: "unknown", workflowFit: "partial", rationale: "Clear value but uncertain implementation", objection: null });
    expect(parseBatchOutput(JSON.stringify({ responses: [response(0), response(1)] }), [0, 1]).responses).toHaveLength(2);
    expect(() => parseBatchOutput(JSON.stringify({ responses: [response(0), response(0)] }), [0, 1])).toThrow();
    expect(() => parseBatchOutput(JSON.stringify({ responses: [{ ...response(0), rationale: "यह हिंदी में है" }] }), [0])).toThrow();
    const legacy = { ordinal: 0, profile: { role: "Founder", context: "Small team", concern: "Budget" },
      rating: 3, rationale: "Promising but needs a clearer price", objection: "Price" };
    expect(parseBatchOutput(JSON.stringify({ responses: [legacy] }), [0], true).responses[0]?.profile.name).toBe("Legacy synthetic participant");
  });

  it("accepts a grounded draft only when audience shares total 100", () => {
    const draft = { audience: [{ name: "Operators", share: 60, need: "Faster review" },
      { name: "Leads", share: 40, need: "Lower risk" }],
      variantA: "A clear baseline offer for operators", variantB: "A lower-risk alternative for leads" };
    expect(parseDraftOutput(JSON.stringify(draft))).toEqual(draft);
    expect(() => parseDraftOutput(JSON.stringify({ ...draft, audience: [{ ...draft.audience[0], share: 50 }, draft.audience[1]] }))).toThrow();
    expect(() => parseDraftOutput(JSON.stringify({ ...draft, variantA: "मुझे यह उत्पाद पसंद है और यह अच्छा है" }))).toThrow();
    expect(renderAbDraftPrompt({ description: "Example product", sourceSummary: "README" })).toContain("Synthetic A/B study preview");
    expect(renderAbTestPrompt({ variantA: "A", variantB: "B", personas: [{ ordinal: 0 }] })).toContain("Synthetic A/B research batch");
    expect(renderPaperclipWakePrompt({ paperclawAbTestPrompt: "Synthetic batch instruction" })).toContain("Synthetic batch instruction");
  });
});
