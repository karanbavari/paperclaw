import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  describeLocalInstancePaths,
  expandHomePrefix,
  resolvePaperClawHomeDir,
  resolvePaperClawInstanceId,
} from "../config/home.js";

const ORIGINAL_ENV = { ...process.env };

describe("home path resolution", () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("defaults to ~/.paperclaw and default instance", () => {
    delete process.env.PAPERCLAW_HOME;
    delete process.env.PAPERCLAW_INSTANCE_ID;

    const paths = describeLocalInstancePaths();
    expect(paths.homeDir).toBe(path.resolve(os.homedir(), ".paperclaw"));
    expect(paths.instanceId).toBe("default");
    expect(paths.configPath).toBe(path.resolve(os.homedir(), ".paperclaw", "instances", "default", "config.json"));
  });

  it("supports PAPERCLAW_HOME and explicit instance ids", () => {
    process.env.PAPERCLAW_HOME = "~/paperclaw-home";

    const home = resolvePaperClawHomeDir();
    expect(home).toBe(path.resolve(os.homedir(), "paperclaw-home"));
    expect(resolvePaperClawInstanceId("dev_1")).toBe("dev_1");
  });

  it("rejects invalid instance ids", () => {
    expect(() => resolvePaperClawInstanceId("bad/id")).toThrow(/Invalid instance id/);
  });

  it("expands ~ prefixes", () => {
    expect(expandHomePrefix("~")).toBe(os.homedir());
    expect(expandHomePrefix("~/x/y")).toBe(path.resolve(os.homedir(), "x/y"));
  });
});
