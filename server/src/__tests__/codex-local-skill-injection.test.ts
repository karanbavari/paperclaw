import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { ensureCodexSkillsInjected } from "@kesarcloud/adapter-codex-local/server";

async function makeTempDir(prefix: string): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), prefix));
}

async function createPaperClawRepoSkill(root: string, skillName: string) {
  await fs.mkdir(path.join(root, "server"), { recursive: true });
  await fs.mkdir(path.join(root, "packages", "adapter-utils"), { recursive: true });
  await fs.mkdir(path.join(root, "skills", skillName), { recursive: true });
  await fs.writeFile(path.join(root, "pnpm-workspace.yaml"), "packages:\n  - packages/*\n", "utf8");
  await fs.writeFile(path.join(root, "package.json"), '{"name":"paperclaw"}\n', "utf8");
  await fs.writeFile(
    path.join(root, "skills", skillName, "SKILL.md"),
    `---\nname: ${skillName}\n---\n`,
    "utf8",
  );
}

async function createCustomSkill(root: string, skillName: string) {
  await fs.mkdir(path.join(root, "custom", skillName), { recursive: true });
  await fs.writeFile(
    path.join(root, "custom", skillName, "SKILL.md"),
    `---\nname: ${skillName}\n---\n`,
    "utf8",
  );
}

describe("codex local adapter skill injection", () => {
  const paperclawKey = "karanbavari/paperclaw/paperclaw";
  const createAgentKey = "karanbavari/paperclaw/paperclaw-create-agent";
  const cleanupDirs = new Set<string>();

  afterEach(async () => {
    await Promise.all(Array.from(cleanupDirs).map((dir) => fs.rm(dir, { recursive: true, force: true })));
    cleanupDirs.clear();
  });

  it("repairs a Codex PaperClaw skill symlink that still points at another live checkout", async () => {
    const currentRepo = await makeTempDir("paperclaw-codex-current-");
    const oldRepo = await makeTempDir("paperclaw-codex-old-");
    const skillsHome = await makeTempDir("paperclaw-codex-home-");
    cleanupDirs.add(currentRepo);
    cleanupDirs.add(oldRepo);
    cleanupDirs.add(skillsHome);

    await createPaperClawRepoSkill(currentRepo, "paperclaw");
    await createPaperClawRepoSkill(currentRepo, "paperclaw-create-agent");
    await createPaperClawRepoSkill(oldRepo, "paperclaw");
    await fs.symlink(path.join(oldRepo, "skills", "paperclaw"), path.join(skillsHome, "paperclaw"));

    const logs: Array<{ stream: "stdout" | "stderr"; chunk: string }> = [];
    await ensureCodexSkillsInjected(
      async (stream, chunk) => {
        logs.push({ stream, chunk });
      },
      {
        skillsHome,
        skillsEntries: [
          {
            key: paperclawKey,
            runtimeName: "paperclaw",
            source: path.join(currentRepo, "skills", "paperclaw"),
          },
          {
            key: createAgentKey,
            runtimeName: "paperclaw-create-agent",
            source: path.join(currentRepo, "skills", "paperclaw-create-agent"),
          },
        ],
      },
    );

    expect(await fs.realpath(path.join(skillsHome, "paperclaw"))).toBe(
      await fs.realpath(path.join(currentRepo, "skills", "paperclaw")),
    );
    expect(await fs.realpath(path.join(skillsHome, "paperclaw-create-agent"))).toBe(
      await fs.realpath(path.join(currentRepo, "skills", "paperclaw-create-agent")),
    );
    expect(logs).toContainEqual(
      expect.objectContaining({
        stream: "stdout",
        chunk: expect.stringContaining('Repaired Codex skill "paperclaw"'),
      }),
    );
    expect(logs).toContainEqual(
      expect.objectContaining({
        stream: "stdout",
        chunk: expect.stringContaining('Injected Codex skill "paperclaw-create-agent"'),
      }),
    );
  });

  it("preserves a custom Codex skill symlink outside PaperClaw repo checkouts", async () => {
    const currentRepo = await makeTempDir("paperclaw-codex-current-");
    const customRoot = await makeTempDir("paperclaw-codex-custom-");
    const skillsHome = await makeTempDir("paperclaw-codex-home-");
    cleanupDirs.add(currentRepo);
    cleanupDirs.add(customRoot);
    cleanupDirs.add(skillsHome);

    await createPaperClawRepoSkill(currentRepo, "paperclaw");
    await createCustomSkill(customRoot, "paperclaw");
    await fs.symlink(path.join(customRoot, "custom", "paperclaw"), path.join(skillsHome, "paperclaw"));

    await ensureCodexSkillsInjected(async () => {}, {
      skillsHome,
      skillsEntries: [{
        key: paperclawKey,
        runtimeName: "paperclaw",
        source: path.join(currentRepo, "skills", "paperclaw"),
      }],
    });

    expect(await fs.realpath(path.join(skillsHome, "paperclaw"))).toBe(
      await fs.realpath(path.join(customRoot, "custom", "paperclaw")),
    );
  });

  it("prunes broken symlinks for unavailable PaperClaw repo skills before Codex starts", async () => {
    const currentRepo = await makeTempDir("paperclaw-codex-current-");
    const oldRepo = await makeTempDir("paperclaw-codex-old-");
    const skillsHome = await makeTempDir("paperclaw-codex-home-");
    cleanupDirs.add(currentRepo);
    cleanupDirs.add(oldRepo);
    cleanupDirs.add(skillsHome);

    await createPaperClawRepoSkill(currentRepo, "paperclaw");
    await createPaperClawRepoSkill(oldRepo, "agent-browser");
    const staleTarget = path.join(oldRepo, "skills", "agent-browser");
    await fs.symlink(staleTarget, path.join(skillsHome, "agent-browser"));
    await fs.rm(staleTarget, { recursive: true, force: true });

    const logs: Array<{ stream: "stdout" | "stderr"; chunk: string }> = [];
    await ensureCodexSkillsInjected(
      async (stream, chunk) => {
        logs.push({ stream, chunk });
      },
      {
        skillsHome,
        skillsEntries: [{
          key: paperclawKey,
          runtimeName: "paperclaw",
          source: path.join(currentRepo, "skills", "paperclaw"),
        }],
      },
    );

    await expect(fs.lstat(path.join(skillsHome, "agent-browser"))).rejects.toMatchObject({
      code: "ENOENT",
    });
    expect(logs).toContainEqual(
      expect.objectContaining({
        stream: "stdout",
        chunk: expect.stringContaining('Removed stale Codex skill "agent-browser"'),
      }),
    );
  });

  it("preserves other live PaperClaw skill symlinks in the shared workspace skill directory", async () => {
    const currentRepo = await makeTempDir("paperclaw-codex-current-");
    const skillsHome = await makeTempDir("paperclaw-codex-home-");
    cleanupDirs.add(currentRepo);
    cleanupDirs.add(skillsHome);

    await createPaperClawRepoSkill(currentRepo, "paperclaw");
    await createPaperClawRepoSkill(currentRepo, "agent-browser");
    await fs.symlink(
      path.join(currentRepo, "skills", "agent-browser"),
      path.join(skillsHome, "agent-browser"),
    );

    await ensureCodexSkillsInjected(async () => {}, {
      skillsHome,
      skillsEntries: [{
        key: paperclawKey,
        runtimeName: "paperclaw",
        source: path.join(currentRepo, "skills", "paperclaw"),
      }],
    });

    expect((await fs.lstat(path.join(skillsHome, "paperclaw"))).isSymbolicLink()).toBe(true);
    expect((await fs.lstat(path.join(skillsHome, "agent-browser"))).isSymbolicLink()).toBe(true);
    expect(await fs.realpath(path.join(skillsHome, "agent-browser"))).toBe(
      await fs.realpath(path.join(currentRepo, "skills", "agent-browser")),
    );
  });
});
