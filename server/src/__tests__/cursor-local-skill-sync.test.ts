import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  listCursorSkills,
  syncCursorSkills,
} from "@kesarcloud/adapter-cursor-local/server";

async function makeTempDir(prefix: string): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), prefix));
}

async function createSkillDir(root: string, name: string) {
  const skillDir = path.join(root, name);
  await fs.mkdir(skillDir, { recursive: true });
  await fs.writeFile(path.join(skillDir, "SKILL.md"), `---\nname: ${name}\n---\n`, "utf8");
  return skillDir;
}

describe("cursor local skill sync", () => {
  const paperclawKey = "karanbavari/paperclaw/paperclaw";
  const cleanupDirs = new Set<string>();

  afterEach(async () => {
    await Promise.all(Array.from(cleanupDirs).map((dir) => fs.rm(dir, { recursive: true, force: true })));
    cleanupDirs.clear();
  });

  it("reports configured PaperClaw skills and installs them into the Cursor skills home", async () => {
    const home = await makeTempDir("paperclaw-cursor-skill-sync-");
    cleanupDirs.add(home);

    const ctx = {
      agentId: "agent-1",
      companyId: "company-1",
      adapterType: "cursor",
      config: {
        env: {
          HOME: home,
        },
        paperclawSkillSync: {
          desiredSkills: [paperclawKey],
        },
      },
    } as const;

    const before = await listCursorSkills(ctx);
    expect(before.mode).toBe("persistent");
    expect(before.desiredSkills).toContain(paperclawKey);
    expect(before.entries.find((entry) => entry.key === paperclawKey)?.required).toBe(true);
    expect(before.entries.find((entry) => entry.key === paperclawKey)?.state).toBe("missing");

    const after = await syncCursorSkills(ctx, [paperclawKey]);
    expect(after.entries.find((entry) => entry.key === paperclawKey)?.state).toBe("installed");
    expect((await fs.lstat(path.join(home, ".cursor", "skills", "paperclaw"))).isSymbolicLink()).toBe(true);
  });

  it("recognizes company-library runtime skills supplied outside the bundled PaperClaw directory", async () => {
    const home = await makeTempDir("paperclaw-cursor-runtime-skills-home-");
    const runtimeSkills = await makeTempDir("paperclaw-cursor-runtime-skills-src-");
    cleanupDirs.add(home);
    cleanupDirs.add(runtimeSkills);

    const paperclawDir = await createSkillDir(runtimeSkills, "paperclaw");
    const asciiHeartDir = await createSkillDir(runtimeSkills, "ascii-heart");

    const ctx = {
      agentId: "agent-3",
      companyId: "company-1",
      adapterType: "cursor",
      config: {
        env: {
          HOME: home,
        },
        paperclawRuntimeSkills: [
          {
            key: "paperclaw",
            runtimeName: "paperclaw",
            source: paperclawDir,
            required: true,
            requiredReason: "Bundled PaperClaw skills are always available for local adapters.",
          },
          {
            key: "ascii-heart",
            runtimeName: "ascii-heart",
            source: asciiHeartDir,
          },
        ],
        paperclawSkillSync: {
          desiredSkills: ["ascii-heart"],
        },
      },
    } as const;

    const before = await listCursorSkills(ctx);
    expect(before.warnings).toEqual([]);
    expect(before.desiredSkills).toEqual(["paperclaw", "ascii-heart"]);
    expect(before.entries.find((entry) => entry.key === "ascii-heart")?.state).toBe("missing");

    const after = await syncCursorSkills(ctx, ["ascii-heart"]);
    expect(after.warnings).toEqual([]);
    expect(after.entries.find((entry) => entry.key === "ascii-heart")?.state).toBe("installed");
    expect((await fs.lstat(path.join(home, ".cursor", "skills", "ascii-heart"))).isSymbolicLink()).toBe(true);
  });

  it("keeps required bundled PaperClaw skills installed even when the desired set is emptied", async () => {
    const home = await makeTempDir("paperclaw-cursor-skill-prune-");
    cleanupDirs.add(home);

    const configuredCtx = {
      agentId: "agent-2",
      companyId: "company-1",
      adapterType: "cursor",
      config: {
        env: {
          HOME: home,
        },
        paperclawSkillSync: {
          desiredSkills: [paperclawKey],
        },
      },
    } as const;

    await syncCursorSkills(configuredCtx, [paperclawKey]);

    const clearedCtx = {
      ...configuredCtx,
      config: {
        env: {
          HOME: home,
        },
        paperclawSkillSync: {
          desiredSkills: [],
        },
      },
    } as const;

    const after = await syncCursorSkills(clearedCtx, []);
    expect(after.desiredSkills).toContain(paperclawKey);
    expect(after.entries.find((entry) => entry.key === paperclawKey)?.state).toBe("installed");
    expect((await fs.lstat(path.join(home, ".cursor", "skills", "paperclaw"))).isSymbolicLink()).toBe(true);
  });
});
