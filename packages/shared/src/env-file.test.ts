import { describe, expect, it } from "vitest";
import { encodeEnvValue, updateEnvFileContents } from "./env-file.js";

describe("env file editor", () => {
  it("pins minimal and JSON value encoding", () => {
    expect(encodeEnvValue("plain-value", "minimal")).toBe("plain-value");
    expect(encodeEnvValue("#439edb", "minimal")).toBe('"#439edb"');
    expect(encodeEnvValue("plain-value", "json")).toBe('"plain-value"');
  });

  it("preserves unrelated content and CRLF while updating every stale duplicate", () => {
    const original = [
      "# operator comment",
      "UNKNOWN='keep this encoding'",
      "",
      "export PAPERCLAW_HOME = '/old path'  # managed path",
      "PAPERCLAW_DUPLICATE=stale",
      'PAPERCLAW_DUPLICATE="current"',
      "TRAILING=untouched",
      "",
    ].join("\r\n");

    const updated = updateEnvFileContents(
      original,
      {
        PAPERCLAW_HOME: "/new path",
        PAPERCLAW_DUPLICATE: "current",
        PAPERCLAW_WORKTREE_COLOR: "#439edb",
      },
      { valueEncoding: "minimal" },
    );

    expect(updated).toBe([
      "# operator comment",
      "UNKNOWN='keep this encoding'",
      "",
      'export PAPERCLAW_HOME = "/new path"  # managed path',
      "PAPERCLAW_DUPLICATE=current",
      'PAPERCLAW_DUPLICATE="current"',
      "TRAILING=untouched",
      'PAPERCLAW_WORKTREE_COLOR="#439edb"',
      "",
    ].join("\r\n"));
    expect(updated.replaceAll("\r\n", "")).not.toContain("\n");
  });

  it("uses JSON encoding for changed values without re-encoding current assignments", () => {
    const original = [
      "PAPERCLAW_CURRENT=plain-value",
      "PAPERCLAW_CHANGED=old",
      "UNKNOWN=\"operator value\"",
      "",
    ].join("\n");

    expect(
      updateEnvFileContents(
        original,
        {
          PAPERCLAW_CURRENT: "plain-value",
          PAPERCLAW_CHANGED: "new",
          PAPERCLAW_ADDED: "added",
        },
        { valueEncoding: "json" },
      ),
    ).toBe([
      "PAPERCLAW_CURRENT=plain-value",
      'PAPERCLAW_CHANGED="new"',
      'UNKNOWN="operator value"',
      'PAPERCLAW_ADDED="added"',
      "",
    ].join("\n"));
  });

  it("does not treat an unquoted dotenv comment as the managed value", () => {
    expect(
      updateEnvFileContents(
        ["PAPERCLAW_COLOR=#439edb", "PAPERCLAW_HOME=old# keep this comment"].join("\n"),
        {
          PAPERCLAW_COLOR: "#439edb",
          PAPERCLAW_HOME: "new",
        },
        { valueEncoding: "minimal" },
      ),
    ).toBe(
      ['PAPERCLAW_COLOR="#439edb"#439edb', "PAPERCLAW_HOME=new# keep this comment"].join("\n"),
    );
  });

  it("is a no-op when every managed duplicate is already current", () => {
    const original = [
      "export PAPERCLAW_HOME = '/same path' # first",
      'PAPERCLAW_HOME="/same path"',
      "UNKNOWN=value",
    ].join("\n");

    expect(updateEnvFileContents(original, { PAPERCLAW_HOME: "/same path" })).toBe(original);
  });
});
