import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type {
  PluginCompanySettings,
  PluginConfig,
  PluginRecord,
} from "@kesarcloud/shared";
import {
  buildPluginSetupSummary,
  updatePluginSetupWizardState,
} from "../services/plugin-setup.js";

const cleanupDirs = new Set<string>();

afterEach(async () => {
  await Promise.all(Array.from(cleanupDirs, (dir) => fs.rm(dir, { recursive: true, force: true })));
  cleanupDirs.clear();
});

function pluginRecord(overrides: Partial<PluginRecord> = {}): PluginRecord {
  const now = new Date("2026-05-12T10:00:00.000Z");
  return {
    id: "11111111-1111-4111-8111-111111111111",
    pluginKey: "paperclaw.test-plugin",
    packageName: "@paperclaw/test-plugin",
    version: "1.0.0",
    apiVersion: 1,
    categories: ["automation"],
    manifestJson: {
      id: "paperclaw.test-plugin",
      apiVersion: 1,
      version: "1.0.0",
      displayName: "Test Plugin",
      description: "Test plugin",
      author: "PaperClaw",
      categories: ["automation"],
      capabilities: ["agent.tools.register"],
      entrypoints: { worker: "dist/worker.js" },
      tools: [
        {
          name: "search",
          displayName: "Search",
          description: "Search things.",
          parametersSchema: {},
        },
      ],
    },
    status: "ready",
    installOrder: 1,
    packagePath: null,
    lastError: null,
    installedAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function settings(settingsJson: Record<string, unknown>): PluginCompanySettings {
  const now = new Date("2026-05-12T10:00:00.000Z");
  return {
    id: "22222222-2222-4222-8222-222222222222",
    companyId: "33333333-3333-4333-8333-333333333333",
    pluginId: "11111111-1111-4111-8111-111111111111",
    enabled: true,
    settingsJson,
    lastError: null,
    createdAt: now,
    updatedAt: now,
  };
}

function registry(input: {
  config?: PluginConfig | null;
  companySettings?: PluginCompanySettings | null;
} = {}) {
  let companySettings = input.companySettings ?? null;
  return {
    getConfig: async () => input.config ?? null,
    getCompanySettings: async () => companySettings,
    upsertCompanySettings: async (
      pluginId: string,
      companyId: string,
      next: { enabled?: boolean; settingsJson: Record<string, unknown>; lastError?: string | null },
    ) => {
      companySettings = settings(next.settingsJson);
      companySettings.pluginId = pluginId;
      companySettings.companyId = companyId;
      companySettings.enabled = next.enabled ?? true;
      companySettings.lastError = next.lastError ?? null;
      return companySettings;
    },
  };
}

describe("plugin setup service", () => {
  it("marks required config as needing action when no config is saved", async () => {
    const plugin = pluginRecord({
      manifestJson: {
        ...pluginRecord().manifestJson,
        capabilities: [],
        instanceConfigSchema: {
          type: "object",
          properties: {
            apiKey: { type: "string", minLength: 1 },
          },
          required: ["apiKey"],
        },
      },
    });

    const summary = await buildPluginSetupSummary({
      registry: registry(),
      plugin,
      companyId: "33333333-3333-4333-8333-333333333333",
    });

    expect(summary.overallStatus).toBe("needs_action");
    expect(summary.nextStepKey).toBe("config");
    expect(summary.steps.find((step) => step.key === "config")?.status).toBe("needs_action");
  });

  it("marks configured local folders healthy when required paths exist", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "paperclaw-plugin-setup-"));
    cleanupDirs.add(root);
    await fs.mkdir(path.join(root, "raw"));
    await fs.writeFile(path.join(root, "WIKI.md"), "# Wiki\n", "utf8");
    const plugin = pluginRecord({
      manifestJson: {
        ...pluginRecord().manifestJson,
        capabilities: ["local.folders"],
        localFolders: [
          {
            folderKey: "wiki-root",
            displayName: "Wiki root",
            access: "readWrite",
            requiredDirectories: ["raw"],
            requiredFiles: ["WIKI.md"],
          },
        ],
      },
    });

    const summary = await buildPluginSetupSummary({
      registry: registry({
        companySettings: settings({
          localFolders: {
            "wiki-root": { path: root },
          },
        }),
      }),
      plugin,
      companyId: "33333333-3333-4333-8333-333333333333",
    });

    expect(summary.steps.find((step) => step.key === "local-folders")?.status).toBe("done");
    expect(summary.overallStatus).toBe("complete");
  });

  it("updates setup state without removing existing local folder settings", async () => {
    const existing = settings({
      localFolders: {
        "wiki-root": { path: "/tmp/wiki" },
      },
    });
    const fakeRegistry = registry({ companySettings: existing });

    await updatePluginSetupWizardState({
      registry: fakeRegistry,
      plugin: pluginRecord(),
      companyId: existing.companyId,
      patch: {
        status: "in_progress",
        currentStepKey: "custom-settings",
        manuallyCompletedStepKeys: ["custom-settings"],
      },
    });

    const updated = await fakeRegistry.getCompanySettings(pluginRecord().id, existing.companyId);
    expect(updated?.settingsJson.localFolders).toEqual(existing.settingsJson.localFolders);
    expect((updated?.settingsJson.setupWizard as { currentStepKey?: string }).currentStepKey).toBe("custom-settings");
  });
});
