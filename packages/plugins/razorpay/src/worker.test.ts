import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { createTestHarness } from "@kesarcloud/plugin-sdk/testing";
import manifest from "./manifest.js";
import plugin from "./worker.js";
import { STATE_KEYS, TOOL_NAMES } from "./constants.js";

describe("razorpay worker", () => {
  it("returns planned order creation in dry-run mode without calling Razorpay", async () => {
    const harness = createTestHarness({
      manifest,
      config: {
        keyId: "rzp_test_key",
        keySecretRef: "key-secret",
        dryRun: true,
      },
    });
    await plugin.definition.setup(harness.ctx);

    const result = await harness.executeTool(TOOL_NAMES.orderCreate, {
      amount: 1000,
      currency: "INR",
      receipt: "rcpt_1",
    }, {
      companyId: "company-1",
      projectId: "project-1",
      agentId: "agent-1",
      runId: "run-1",
    });

    expect(result.content).toContain("Dry run prepared");
    expect(result.content).toContain("Razorpay was not changed");
    expect(result.data).toMatchObject({
      dryRun: true,
      operation: "order",
      method: "POST",
      path: "/orders",
    });
  });

  it("rejects disallowed refund operations", async () => {
    const harness = createTestHarness({
      manifest,
      config: {
        keyId: "rzp_test_key",
        keySecretRef: "key-secret",
        allowedOperations: ["read"],
      },
    });
    await plugin.definition.setup(harness.ctx);

    const result = await harness.executeTool(TOOL_NAMES.refundCreate, {
      paymentId: "pay_123",
      amount: 100,
    });

    expect(result.error).toContain("not enabled");
  });

  it("verifies and dedupes incoming webhooks", async () => {
    const harness = createTestHarness({
      manifest,
      config: {
        keyId: "rzp_test_key",
        keySecretRef: "key-secret",
        webhookSecretRef: "webhook-secret",
      },
    });
    await plugin.definition.setup(harness.ctx);
    const rawBody = JSON.stringify({ event: "payment.captured", payload: { payment: { entity: { id: "pay_123" } } } });
    const secret = "resolved:webhook-secret";
    const signature = createHmac("sha256", secret).update(rawBody).digest("hex");

    await plugin.definition.onWebhook?.({
      endpointKey: "razorpay",
      headers: {
        "x-razorpay-signature": signature,
        "x-razorpay-event-id": "evt_1",
      },
      rawBody,
      parsedBody: JSON.parse(rawBody),
      requestId: "request-1",
    });
    await plugin.definition.onWebhook?.({
      endpointKey: "razorpay",
      headers: {
        "x-razorpay-signature": signature,
        "x-razorpay-event-id": "evt_1",
      },
      rawBody,
      parsedBody: JSON.parse(rawBody),
      requestId: "request-2",
    });

    const webhooks = harness.getState({ scopeKind: "instance", stateKey: STATE_KEYS.recentWebhooks });
    expect(Array.isArray(webhooks) ? webhooks.length : 0).toBe(1);
  });
});
