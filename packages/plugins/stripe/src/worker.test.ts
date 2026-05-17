import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { createTestHarness } from "@kesarcloud/plugin-sdk/testing";
import manifest from "./manifest.js";
import plugin from "./worker.js";
import { STATE_KEYS, TOOL_NAMES } from "./constants.js";

describe("stripe worker", () => {
  it("returns planned PaymentIntent creation in dry-run mode without calling Stripe", async () => {
    const harness = createTestHarness({
      manifest,
      config: {
        secretKeyRef: "stripe-secret",
        dryRun: true,
      },
    });
    await plugin.definition.setup(harness.ctx);

    const result = await harness.executeTool(TOOL_NAMES.paymentIntentCreate, {
      amount: 1000,
      currency: "usd",
      description: "Demo payment",
    }, {
      companyId: "company-1",
      projectId: "project-1",
      agentId: "agent-1",
      runId: "run-1",
    });

    expect(result.content).toContain("Dry run prepared");
    expect(result.content).toContain("Stripe was not changed");
    expect(result.data).toMatchObject({
      dryRun: true,
      operation: "payment_intent",
      method: "POST",
      path: "/payment_intents",
    });
    expect(JSON.stringify(result.data)).toContain("amount=1000");
  });

  it("rejects disallowed refund operations", async () => {
    const harness = createTestHarness({
      manifest,
      config: {
        secretKeyRef: "stripe-secret",
        allowedOperations: ["read"],
      },
    });
    await plugin.definition.setup(harness.ctx);

    const result = await harness.executeTool(TOOL_NAMES.refundCreate, {
      payment_intent: "pi_123",
      amount: 100,
    });

    expect(result.error).toContain("not enabled");
  });

  it("plans Checkout Session line item params in dry-run mode", async () => {
    const harness = createTestHarness({
      manifest,
      config: {
        secretKeyRef: "stripe-secret",
        dryRun: true,
      },
    });
    await plugin.definition.setup(harness.ctx);

    const result = await harness.executeTool(TOOL_NAMES.checkoutSessionCreate, {
      mode: "payment",
      success_url: "https://example.com/success",
      line_items: [{
        price_data: {
          currency: "usd",
          unit_amount: 1500,
          product_data: { name: "Demo" },
        },
        quantity: 1,
      }],
    });

    expect(result.content).toContain("Dry run prepared");
    expect(JSON.stringify(result.data)).toContain("line_items%5B0%5D%5Bprice_data%5D%5Bunit_amount%5D=1500");
  });

  it("verifies and dedupes incoming webhooks", async () => {
    const harness = createTestHarness({
      manifest,
      config: {
        secretKeyRef: "stripe-secret",
        webhookSecretRef: "webhook-secret",
        webhookToleranceSeconds: 300,
      },
    });
    await plugin.definition.setup(harness.ctx);
    const rawBody = JSON.stringify({ id: "evt_1", type: "payment_intent.succeeded", data: { object: { object: "payment_intent", id: "pi_123" } } });
    const secret = "resolved:webhook-secret";
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
    const header = `t=${timestamp},v1=${signature}`;

    await plugin.definition.onWebhook?.({
      endpointKey: "stripe",
      headers: { "stripe-signature": header },
      rawBody,
      parsedBody: JSON.parse(rawBody),
      requestId: "request-1",
    });
    await plugin.definition.onWebhook?.({
      endpointKey: "stripe",
      headers: { "stripe-signature": header },
      rawBody,
      parsedBody: JSON.parse(rawBody),
      requestId: "request-2",
    });

    const webhooks = harness.getState({ scopeKind: "instance", stateKey: STATE_KEYS.recentWebhooks });
    expect(Array.isArray(webhooks) ? webhooks.length : 0).toBe(1);
  });
});
