import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  assertAmountLimit,
  assertCurrencyAllowed,
  encodeBasicAuth,
  normalizeConfig,
  validateConfig,
  verifyWebhookSignature,
} from "./razorpay-client.js";

describe("razorpay client helpers", () => {
  it("encodes Basic Auth exactly as Razorpay expects", () => {
    expect(encodeBasicAuth("rzp_test_key", "secret")).toBe(`Basic ${Buffer.from("rzp_test_key:secret").toString("base64")}`);
  });

  it("normalizes safe defaults", () => {
    const { config, errors } = validateConfig({
      keyId: "rzp_test_key",
      keySecretRef: "00000000-0000-4000-8000-000000000001",
    });
    expect(errors).toEqual([]);
    expect(config.dryRun).toBe(true);
    expect(config.allowedCurrencies).toEqual(["INR"]);
    expect(config.modeLabel).toBe("test");
  });

  it("enforces amount and currency guardrails", () => {
    const config = normalizeConfig({ allowedCurrencies: ["INR"], maxRefundAmountSubunits: 500 });
    expect(assertCurrencyAllowed(config, "inr")).toBe("INR");
    expect(() => assertCurrencyAllowed(config, "USD")).toThrow("not enabled");
    expect(assertAmountLimit(500, config.maxRefundAmountSubunits, "Refund amount")).toBe(500);
    expect(() => assertAmountLimit(501, config.maxRefundAmountSubunits, "Refund amount")).toThrow("exceeds");
  });

  it("verifies Razorpay webhook signatures over raw body", () => {
    const secret = "webhook-secret";
    const rawBody = JSON.stringify({ event: "payment.captured" });
    const signature = createHmac("sha256", secret).update(rawBody).digest("hex");
    expect(verifyWebhookSignature(rawBody, signature, secret)).toBe(true);
    expect(verifyWebhookSignature(`${rawBody}\n`, signature, secret)).toBe(false);
  });
});
