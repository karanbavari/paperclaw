import { describe, expect, it } from "vitest";
import { renderAgentToolsMarkdown } from "../services/agent-tools-md.js";

describe("agent tools markdown", () => {
  it("renders explicit agent assignments and company policy context", () => {
    const content = renderAgentToolsMarkdown({
      generatedAt: new Date("2026-05-16T00:00:00.000Z"),
      agent: {
        id: "agent-1",
        name: "Developer",
        role: "engineer",
        title: "Software Developer",
      },
      policies: [
        {
          id: "policy-1",
          companyId: "company-1",
          subjectType: "agent",
          subjectId: "agent-1",
          pluginKey: "paperweight",
          toolName: "draft",
          effect: "allow",
          budgetLimit: null,
          enabled: true,
          createdByUserId: "board",
          updatedByUserId: "board",
          createdAt: new Date("2026-05-16T00:00:00.000Z"),
          updatedAt: new Date("2026-05-16T00:00:00.000Z"),
        },
        {
          id: "policy-2",
          companyId: "company-1",
          subjectType: "company",
          subjectId: null,
          pluginKey: "billing",
          toolName: null,
          effect: "approval_required",
          budgetLimit: null,
          enabled: true,
          createdByUserId: "board",
          updatedByUserId: "board",
          createdAt: new Date("2026-05-16T00:00:00.000Z"),
          updatedAt: new Date("2026-05-16T00:00:00.000Z"),
        },
      ],
    });

    expect(content).toContain("<!-- paperclaw:generated-tools-md v1 -->");
    expect(content).toContain("Agent: Developer (Software Developer)");
    expect(content).toContain("`paperweight:draft` -- allowed");
    expect(content).toContain("`billing:*` -- approval required");
    expect(content).toContain("Backend tool permissions are the source of truth");
  });
});
