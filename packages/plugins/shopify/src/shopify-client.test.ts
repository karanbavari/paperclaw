import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  normalizeConfig,
  normalizeShopDomain,
  validateConfig,
  verifyShopifyHmac,
} from "./shopify-client.js";

describe("shopify client helpers", () => {
  it("normalizes only valid myshopify domains", () => {
    expect(normalizeShopDomain("https://Demo-Store.myshopify.com/admin")).toBe("demo-store.myshopify.com");
    expect(normalizeShopDomain("demo-store.myshopify.com")).toBe("demo-store.myshopify.com");
    expect(normalizeShopDomain("example.com")).toBe("");
  });

  it("validates OAuth config and keeps dry-run enabled by default", () => {
    const { config, errors } = validateConfig({
      appApiKey: "client-id",
      appApiSecretRef: "00000000-0000-4000-8000-000000000001",
    });
    expect(errors).toEqual([]);
    expect(config.dryRun).toBe(true);
    expect(config.apiVersion).toBe("2026-04");
  });

  it("verifies Shopify OAuth HMAC", () => {
    const secret = "shpss_test_secret";
    const message = "code=temporary-code&shop=demo-store.myshopify.com&state=state-1&timestamp=1710000000";
    const hmac = createHmac("sha256", secret).update(message).digest("hex");
    const params = new URLSearchParams(`${message}&hmac=${hmac}`);
    expect(verifyShopifyHmac(params, secret)).toBe(true);
    params.set("state", "tampered");
    expect(verifyShopifyHmac(params, secret)).toBe(false);
  });

  it("normalizes allowlisted shop domains", () => {
    const config = normalizeConfig({
      allowedShopDomains: ["https://A.myshopify.com/admin", "bad.example.com"],
    });
    expect(config.allowedShopDomains).toEqual(["a.myshopify.com"]);
  });
});
