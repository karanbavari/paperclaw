import { describe, expect, it } from "vitest";
import { buildGwsCommand, buildRawGwsCommand, normalizeConfig } from "./gws-runner.js";

describe("gws runner", () => {
  it("builds structured gws args without shell strings", () => {
    const plan = buildGwsCommand({
      service: "drive",
      parts: ["files", "list"],
      params: { q: "name contains 'report'", pageSize: 10 },
      summary: "search Drive files",
    });

    expect(plan.args).toEqual([
      "drive",
      "files",
      "list",
      "--params",
      JSON.stringify({ q: "name contains 'report'", pageSize: 10 }),
    ]);
  });

  it("rejects unsafe raw command tokens", () => {
    expect(() => buildRawGwsCommand({
      service: "drive;rm -rf /",
      method: "files.list",
    })).toThrow("Unsafe service");
  });

  it("normalizes allowed services and dry-run defaults", () => {
    const config = normalizeConfig({
      allowedServices: ["gmail", "drive", "gmail", "bad|service"],
    });

    expect(config.dryRun).toBe(true);
    expect(config.allowedServices).toEqual(["gmail", "drive"]);
  });

  it("treats raw commands as mutating and adds dry-run flag when explicit", () => {
    const plan = buildRawGwsCommand({
      service: "calendar",
      resource: "events",
      method: "insert",
      dryRun: true,
    });

    expect(plan.mutating).toBe(true);
    expect(plan.args).toContain("--dry-run");
  });

  it("treats raw commands as mutating even without explicit dry-run", () => {
    const plan = buildRawGwsCommand({
      service: "calendar",
      resource: "events",
      method: "insert",
    });

    expect(plan.mutating).toBe(true);
    expect(plan.args).not.toContain("--dry-run");
  });
});
