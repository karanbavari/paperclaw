import { describe, expect, it } from "vitest";
import { updateCompanySchema } from "./company.js";

describe("company validators", () => {
  it("accepts configured concurrent agent run limits and unlimited", () => {
    expect(updateCompanySchema.parse({ maxConcurrentAgentRuns: "20" }).maxConcurrentAgentRuns).toBe(20);
    expect(updateCompanySchema.parse({ maxConcurrentAgentRuns: 30 }).maxConcurrentAgentRuns).toBe(30);
    expect(updateCompanySchema.parse({ maxConcurrentAgentRuns: null }).maxConcurrentAgentRuns).toBeNull();
  });

  it("rejects unsupported concurrent agent run limits", () => {
    expect(() => updateCompanySchema.parse({ maxConcurrentAgentRuns: 15 })).toThrow();
    expect(() => updateCompanySchema.parse({ maxConcurrentAgentRuns: "unlimited" })).toThrow();
  });
});
