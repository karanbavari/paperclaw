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

describe("X plugin", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("prepares mutating X requests without calling X in dry-run mode", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const harness = createTestHarness({
      manifest,
      config: {
        clientId: "client-1",
        clientSecretRef: "00000000-0000-4000-8000-000000000001",
        refreshTokenSecretRef: "00000000-0000-4000-8000-000000000002",
        connectedCompanyId: runCtx.companyId,
        connectedUserId: "2244994945",
        dryRun: true,
      },
    });
    await plugin.definition.setup(harness.ctx);

    const result = await harness.executeTool(TOOL_NAMES.createPost, {
      text: "Shipping the PaperClaw X plugin.",
      madeWithAi: true,
    }, runCtx);

    expect(result.content).toContain("Dry run");
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.data).toMatchObject({
      operation: "create post",
      path: "/2/tweets",
      dryRun: true,
    });
  });

  it("refreshes an access token and executes live read tools", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
      const href = String(url);
      if (href.includes("/2/oauth2/token")) {
        return new Response(JSON.stringify({ access_token: "access-123", expires_in: 7200 }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ data: [{ id: "20", text: "hello" }] }), {
        status: 200,
        headers: {
          "content-type": "application/json",
          "x-rate-limit-limit": "300",
          "x-rate-limit-remaining": "299",
          "x-rate-limit-reset": "1760000000",
        },
      });
    });
    const harness = createTestHarness({
      manifest,
      config: {
        clientId: "client-1",
        clientSecretRef: "00000000-0000-4000-8000-000000000001",
        refreshTokenSecretRef: "00000000-0000-4000-8000-000000000002",
        connectedCompanyId: runCtx.companyId,
        connectedUserId: "2244994945",
        dryRun: false,
      },
    });
    await plugin.definition.setup(harness.ctx);

    const result = await harness.executeTool(TOOL_NAMES.searchRecentPosts, { query: "paperclaw", maxResults: 10 }, runCtx);

    expect(result.content).toContain("X request completed");
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("/2/oauth2/token"),
      expect.objectContaining({ method: "POST" }),
    );
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("/2/tweets/search/recent?"),
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({ authorization: "Bearer access-123" }),
      }),
    );
    expect(result.data).toMatchObject({
      rateLimit: {
        limit: "300",
        remaining: "299",
        reset: "1760000000",
      },
    });
  });

  it("exchanges OAuth codes and stores refresh tokens without exposing them", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
      const href = String(url);
      if (href.includes("/2/oauth2/token")) {
        return new Response(JSON.stringify({
          access_token: "access-123",
          refresh_token: "refresh-123",
          expires_in: 7200,
          scope: "offline.access tweet.read tweet.write users.read",
          token_type: "Bearer",
        }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      return new Response(JSON.stringify({
        data: {
          id: "2244994945",
          name: "X Dev",
          username: "XDevelopers",
        },
      }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    });
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
      redirectUri: "https://paperclaw.example/acme/x",
    });

    expect(result).toMatchObject({
      refreshTokenSecretRef: expect.stringContaining("00000000-0000-4000-8000-"),
      connectedUserId: "2244994945",
      connectedUsername: "XDevelopers",
      connectedDisplayName: "X Dev",
      scope: "offline.access tweet.read tweet.write users.read",
      tokenType: "Bearer",
    });
    expect(JSON.stringify(result)).not.toContain("refresh-123");
    expect(JSON.stringify(result)).not.toContain("resolved:");
  });
});
