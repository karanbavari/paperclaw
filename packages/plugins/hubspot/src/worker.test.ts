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

describe("HubSpot plugin", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("stores private access tokens without exposing the token", async () => {
    const harness = createTestHarness({ manifest });
    await plugin.definition.setup(harness.ctx);

    const result = await harness.performAction(ACTION_KEYS.savePrivateAccessToken, {
      companyId: runCtx.companyId,
      privateAccessToken: "pat-na1-secret",
    });

    expect(result).toMatchObject({
      secretRef: expect.stringContaining("00000000-0000-4000-8000-"),
    });
    expect(JSON.stringify(result)).not.toContain("pat-na1-secret");
  });

  it("prepares mutating CRM requests without calling HubSpot in dry-run mode", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const harness = createTestHarness({
      manifest,
      config: {
        authMode: "private_token",
        privateAccessTokenSecretRef: "00000000-0000-4000-8000-000000000001",
        connectedCompanyId: runCtx.companyId,
        dryRun: true,
      },
    });
    await plugin.definition.setup(harness.ctx);

    const result = await harness.executeTool(TOOL_NAMES.contactCreate, {
      properties: { email: "ada@example.com", firstname: "Ada" },
    }, runCtx);

    expect(result.content).toContain("Dry run");
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.data).toMatchObject({
      operation: "create contacts",
      path: "/crm/v3/objects/contacts",
      dryRun: true,
    });
  });

  it("uses private tokens for live CRM reads and returns rate limit metadata", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      results: [{ id: "1", properties: { email: "ada@example.com" } }],
    }), {
      status: 200,
      headers: {
        "content-type": "application/json",
        "x-hubspot-ratelimit-max": "110",
        "x-hubspot-ratelimit-remaining": "109",
      },
    }));
    const harness = createTestHarness({
      manifest,
      config: {
        authMode: "private_token",
        privateAccessTokenSecretRef: "00000000-0000-4000-8000-000000000001",
        connectedCompanyId: runCtx.companyId,
        dryRun: false,
      },
    });
    await plugin.definition.setup(harness.ctx);

    const result = await harness.executeTool(TOOL_NAMES.contactsList, { limit: 10, properties: ["email"] }, runCtx);

    expect(result.content).toContain("HubSpot request completed");
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("/crm/v3/objects/contacts?"),
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({ authorization: "Bearer resolved:00000000-0000-4000-8000-000000000001" }),
      }),
    );
    expect(result.data).toMatchObject({
      rateLimit: {
        max: "110",
        remaining: "109",
      },
    });
  });

  it("refreshes OAuth tokens and executes CRM search", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
      const href = String(url);
      if (href.includes("/oauth/v1/token")) {
        return new Response(JSON.stringify({ access_token: "access-123", expires_in: 1800, token_type: "bearer" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ total: 1, results: [{ id: "10" }] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    });
    const harness = createTestHarness({
      manifest,
      config: {
        authMode: "oauth",
        clientId: "client-1",
        clientSecretRef: "00000000-0000-4000-8000-000000000001",
        refreshTokenSecretRef: "00000000-0000-4000-8000-000000000002",
        connectedCompanyId: runCtx.companyId,
        dryRun: false,
      },
    });
    await plugin.definition.setup(harness.ctx);

    const result = await harness.executeTool(TOOL_NAMES.contactsSearch, {
      query: "ada@example.com",
      properties: ["email"],
      limit: 5,
    }, runCtx);

    expect(result.content).toContain("HubSpot request completed");
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("/oauth/v1/token"),
      expect.objectContaining({ method: "POST" }),
    );
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("/crm/v3/objects/contacts/search"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ authorization: "Bearer access-123" }),
        body: expect.stringContaining("ada@example.com"),
      }),
    );
  });

  it("builds HubSpot association v4 requests", async () => {
    const harness = createTestHarness({
      manifest,
      config: {
        authMode: "private_token",
        privateAccessTokenSecretRef: "00000000-0000-4000-8000-000000000001",
        connectedCompanyId: runCtx.companyId,
        dryRun: true,
      },
    });
    await plugin.definition.setup(harness.ctx);

    const result = await harness.executeTool(TOOL_NAMES.associationCreateDefault, {
      fromObjectType: "contacts",
      fromObjectId: "1",
      toObjectType: "companies",
      toObjectId: "2",
    }, runCtx);

    expect(result.data).toMatchObject({
      method: "PUT",
      path: "/crm/v4/objects/contacts/1/associations/default/companies/2",
      dryRun: true,
    });
  });

  it("exchanges OAuth codes and stores refresh tokens without exposing them", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
      const href = String(url);
      if (href.includes("/oauth/v1/token")) {
        return new Response(JSON.stringify({
          access_token: "access-123",
          refresh_token: "refresh-123",
          expires_in: 1800,
          token_type: "bearer",
        }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ hub_id: 12345 }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    });
    const harness = createTestHarness({
      manifest,
      config: {
        authMode: "oauth",
        clientId: "client-1",
        clientSecretRef: "00000000-0000-4000-8000-000000000001",
      },
    });
    await plugin.definition.setup(harness.ctx);

    const result = await harness.performAction(ACTION_KEYS.completeOauth, {
      companyId: runCtx.companyId,
      code: "code-1",
      redirectUri: "https://paperclaw.example/acme/hubspot",
    });

    expect(result).toMatchObject({
      refreshTokenSecretRef: expect.stringContaining("00000000-0000-4000-8000-"),
      portalId: "12345",
      tokenType: "bearer",
    });
    expect(JSON.stringify(result)).not.toContain("refresh-123");
    expect(JSON.stringify(result)).not.toContain("resolved:");
  });
});
