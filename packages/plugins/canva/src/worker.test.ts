import { afterEach, describe, expect, it, vi } from "vitest";
import { createTestHarness } from "@kesarcloud/plugin-sdk/testing";
import manifest from "./manifest.js";
import plugin from "./worker.js";
import { ACTION_KEYS, TOOL_NAMES } from "./constants.js";

const runCtx = {
  companyId: "company-1",
  projectId: "project-1",
  agentId: "agent-1",
  runId: "run-1",
};

describe("Canva plugin", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("prepares mutating Canva requests without calling Canva in dry-run mode", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const harness = createTestHarness({
      manifest,
      config: {
        clientId: "client-1",
        clientSecretRef: "00000000-0000-4000-8000-000000000001",
        refreshTokenSecretRef: "00000000-0000-4000-8000-000000000002",
        connectedCompanyId: runCtx.companyId,
        dryRun: true,
      },
    });
    await plugin.definition.setup(harness.ctx);

    const result = await harness.executeTool(TOOL_NAMES.createDesign, {
      designType: { type: "preset", name: "presentation" },
      title: "Quarterly plan",
    }, runCtx);

    expect(result.content).toContain("Dry run");
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.data).toMatchObject({
      operation: "create design",
      dryRun: true,
    });
  });

  it("refreshes an access token and executes live read tools", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
      const href = String(url);
      if (href.includes("/v1/oauth/token")) {
        return new Response(JSON.stringify({ access_token: "access-123", expires_in: 3600 }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ designs: [{ id: "D1", title: "Demo" }] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    });
    const harness = createTestHarness({
      manifest,
      config: {
        clientId: "client-1",
        clientSecretRef: "00000000-0000-4000-8000-000000000001",
        refreshTokenSecretRef: "00000000-0000-4000-8000-000000000002",
        connectedCompanyId: runCtx.companyId,
        dryRun: false,
      },
    });
    await plugin.definition.setup(harness.ctx);

    const result = await harness.executeTool(TOOL_NAMES.listDesigns, { query: "demo" }, runCtx);

    expect(result.content).toContain("Canva request completed");
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("/v1/oauth/token"),
      expect.objectContaining({ method: "POST" }),
    );
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("/v1/designs?query=demo"),
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({ authorization: "Bearer access-123" }),
      }),
    );
  });

  it("exchanges OAuth codes without exposing client secrets in the result", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      access_token: "access-123",
      refresh_token: "refresh-123",
      expires_in: 3600,
      scope: "profile:read design:meta:read",
      token_type: "Bearer",
    }), {
      status: 200,
      headers: { "content-type": "application/json" },
    }));
    const harness = createTestHarness({
      manifest,
      config: {
        clientId: "client-1",
        clientSecretRef: "00000000-0000-4000-8000-000000000001",
        dryRun: true,
      },
    });
    await plugin.definition.setup(harness.ctx);

    const result = await harness.performAction(ACTION_KEYS.completeOauth, {
      companyId: runCtx.companyId,
      code: "code-1",
      codeVerifier: "verifier-1",
      redirectUri: "https://paperclaw.example/acme/canva",
    });

    expect(result).toMatchObject({
      refreshTokenSecretRef: expect.stringContaining("00000000-0000-4000-8000-"),
      scope: "profile:read design:meta:read",
      tokenType: "Bearer",
    });
    expect(JSON.stringify(result)).not.toContain("refresh-123");
    expect(JSON.stringify(result)).not.toContain("resolved:");
  });
});
