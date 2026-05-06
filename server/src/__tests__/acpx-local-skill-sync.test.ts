import { describe, expect, it } from "vitest";
import {
  listAcpxSkills,
  syncAcpxSkills,
} from "@kesarcloud/adapter-acpx-local/server";

describe("acpx local skill sync", () => {
  const paperclawKey = "karanbavari/paperclaw/paperclaw";
  const createAgentKey = "karanbavari/paperclaw/paperclaw-create-agent";

  it("reports ACPX Claude skills as supported runtime-mounted state", async () => {
    const snapshot = await listAcpxSkills({
      agentId: "agent-1",
      companyId: "company-1",
      adapterType: "acpx_local",
      config: {
        agent: "claude",
        paperclawSkillSync: {
          desiredSkills: [paperclawKey],
        },
      },
    });

    expect(snapshot.adapterType).toBe("acpx_local");
    expect(snapshot.supported).toBe(true);
    expect(snapshot.mode).toBe("ephemeral");
    expect(snapshot.desiredSkills).toContain(paperclawKey);
    expect(snapshot.desiredSkills).toContain(createAgentKey);
    expect(snapshot.entries.find((entry) => entry.key === paperclawKey)?.state).toBe("configured");
    expect(snapshot.entries.find((entry) => entry.key === paperclawKey)?.detail).toContain("ACPX Claude session");
    expect(snapshot.warnings).toEqual([]);
  });

  it("reports ACPX Codex skills with Codex home runtime detail", async () => {
    const snapshot = await syncAcpxSkills({
      agentId: "agent-2",
      companyId: "company-1",
      adapterType: "acpx_local",
      config: {
        agent: "codex",
        paperclawSkillSync: {
          desiredSkills: ["paperclaw"],
        },
      },
    }, ["paperclaw"]);

    expect(snapshot.supported).toBe(true);
    expect(snapshot.mode).toBe("ephemeral");
    expect(snapshot.desiredSkills).toContain(paperclawKey);
    expect(snapshot.desiredSkills).not.toContain("paperclaw");
    expect(snapshot.entries.find((entry) => entry.key === paperclawKey)?.state).toBe("configured");
    expect(snapshot.entries.find((entry) => entry.key === paperclawKey)?.detail).toContain("CODEX_HOME/skills/");
    expect(snapshot.warnings).toEqual([]);
  });

  it("keeps ACPX custom skill selection tracked but unsupported", async () => {
    const snapshot = await listAcpxSkills({
      agentId: "agent-3",
      companyId: "company-1",
      adapterType: "acpx_local",
      config: {
        agent: "custom",
        paperclawSkillSync: {
          desiredSkills: [paperclawKey],
        },
      },
    });

    expect(snapshot.supported).toBe(false);
    expect(snapshot.mode).toBe("unsupported");
    expect(snapshot.desiredSkills).toContain(paperclawKey);
    expect(snapshot.entries.find((entry) => entry.key === paperclawKey)?.desired).toBe(true);
    expect(snapshot.entries.find((entry) => entry.key === paperclawKey)?.detail).toContain("stored in PaperClaw only");
    expect(snapshot.warnings).toContain(
      "Custom ACP commands do not expose a PaperClaw skill integration contract yet; selected skills are tracked only.",
    );
  });
});
