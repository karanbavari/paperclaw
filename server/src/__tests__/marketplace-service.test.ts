import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { marketplaceService } from "../services/marketplace.js";

const previousLocalRoot = process.env.PAPERCLAW_SKILL_MARKETPLACE_LOCAL_ROOT;
const previousRemoteUrl = process.env.PAPERCLAW_SKILL_MARKETPLACE_URL;

describe("marketplaceService local fallback catalog", () => {
  const cleanupDirs = new Set<string>();

  afterEach(async () => {
    if (previousLocalRoot === undefined) {
      delete process.env.PAPERCLAW_SKILL_MARKETPLACE_LOCAL_ROOT;
    } else {
      process.env.PAPERCLAW_SKILL_MARKETPLACE_LOCAL_ROOT = previousLocalRoot;
    }
    if (previousRemoteUrl === undefined) {
      delete process.env.PAPERCLAW_SKILL_MARKETPLACE_URL;
    } else {
      process.env.PAPERCLAW_SKILL_MARKETPLACE_URL = previousRemoteUrl;
    }
    await Promise.all(Array.from(cleanupDirs, (dir) => fs.rm(dir, { recursive: true, force: true })));
    cleanupDirs.clear();
  });

  it("parses awesome skill category markdown into marketplace categories and skills", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "paperclaw-marketplace-"));
    cleanupDirs.add(root);
    await fs.mkdir(path.join(root, "categories"), { recursive: true });
    await fs.writeFile(
      path.join(root, "categories", "communication.md"),
      [
        "# Communication",
        "",
        "**2 skills**",
        "",
        "- [agent-mail](https://clawskills.sh/skills/rimelucci-agent-mail) - Email inbox for AI agents.",
        "- [github-skill](https://github.com/openclaw/skills/tree/main/skills/demo/github-skill) - GitHub backed skill.",
      ].join("\n"),
      "utf8",
    );
    process.env.PAPERCLAW_SKILL_MARKETPLACE_LOCAL_ROOT = root;
    delete process.env.PAPERCLAW_SKILL_MARKETPLACE_URL;

    const svc = marketplaceService({} as never);
    await expect(svc.categories()).resolves.toEqual([
      { id: "communication", name: "Communication", slug: "communication", skillCount: 2 },
    ]);
  });
});
