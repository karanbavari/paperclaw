import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  assertAmountLimit,
  assertCurrencyAllowed,
  encodeBasicAuth,
  encodeStripeForm,
  normalizeConfig,
  validateConfig,
  verifyStripeWebhookSignature,
} from "./stripe-client.js";

describe("stripe client helpers", () => {
  it("encodes Basic Auth with a trailing colon for secret-key auth", () => {
    expect(encodeBasicAuth("sk_test_secret")).toBe(`Basic ${Buffer.from("sk_test_secret:").toString("base64")}`);
  });

  it("encodes nested Stripe form params", () => {
    const encoded = encodeStripeForm({
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: 1000,
            product_data: { name: "Demo" },
          },
          quantity: 2,
        },
      ],
      metadata: { source: "paperclaw" },
    });
    expect(encoded).toContain("line_items%5B0%5D%5Bprice_data%5D%5Bcurrency%5D=usd");
    expect(encoded).toContain("line_items%5B0%5D%5Bprice_data%5D%5Bunit_amount%5D=1000");
    expect(encoded).toContain("metadata%5Bsource%5D=paperclaw");
  });

  it("normalizes safe defaults and validates required secret ref", () => {
    const missing = validateConfig({});
    expect(missing.errors).toContain("Stripe secret key reference is required.");
    const { config, errors } = validateConfig({ secretKeyRef: "secret-ref" });
    expect(errors).toEqual([]);
    expect(config.dryRun).toBe(true);
    expect(config.allowedCurrencies).toEqual(["usd", "inr"]);
  });

  it("enforces amount and currency guardrails", () => {
    const config = normalizeConfig({ allowedCurrencies: ["USD"], maxRefundAmountSubunits: 500 });
    expect(assertCurrencyAllowed(config, "usd")).toBe("usd");
    expect(() => assertCurrencyAllowed(config, "eur")).toThrow("not enabled");
    expect(assertAmountLimit(500, config.maxRefundAmountSubunits, "Refund amount")).toBe(500);
    expect(() => assertAmountLimit(501, config.maxRefundAmountSubunits, "Refund amount")).toThrow("exceeds");
  });

  it("verifies Stripe webhook signatures with tolerance", () => {
    const secret = "whsec_test";
    const rawBody = JSON.stringify({ id: "evt_1", type: "payment_intent.succeeded" });
    const timestamp = 1_700_000_000;
    const signature = createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
    const header = `t=${timestamp},v1=${signature}`;
    expect(verifyStripeWebhookSignature({ rawBody, signatureHeader: header, secret, toleranceSeconds: 300, nowSeconds: timestamp + 10 })).toBe(true);
    expect(verifyStripeWebhookSignature({ rawBody, signatureHeader: header, secret, toleranceSeconds: 300, nowSeconds: timestamp + 500 })).toBe(false);
    expect(verifyStripeWebhookSignature({ rawBody: `${rawBody}\n`, signatureHeader: header, secret, toleranceSeconds: 300, nowSeconds: timestamp + 10 })).toBe(false);
  });
});
