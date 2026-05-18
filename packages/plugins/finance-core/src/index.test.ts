import { describe, expect, it } from "vitest";
import { createFinanceManifest, type FinanceDefinition } from "./index.js";

const definition: FinanceDefinition = {
  id: "paperclaw.example-finance",
  packageName: "@kesarcloud/plugin-example-finance",
  version: "0.1.0",
  displayName: "Example Finance",
  routePath: "example-finance",
  description: "Example finance connector.",
  apiBaseUrl: "https://api.example.com",
  authUrl: "https://example.com/oauth/authorize",
  tokenUrl: "https://api.example.com/oauth/token",
  tokenLabel: "Access Token",
  oauthLabel: "Example OAuth",
  connectedLabel: "Connected Account",
  defaultScopes: ["read", "write"],
  rawPathPrefixes: ["/v1/"],
  endpoints: [
    { key: "itemsList", displayName: "List Items", description: "List items.", method: "GET", path: "/v1/items", queryParams: ["limit"] },
    { key: "itemCreate", displayName: "Create Item", description: "Create item.", method: "POST", path: "/v1/items", bodyParam: "item", mutating: true },
  ],
};

describe("finance core", () => {
  it("creates finance manifests with tools and UI slots", () => {
    const manifest = createFinanceManifest(definition);
    expect(manifest.categories).toContain("finance");
    expect(manifest.tools?.map((tool) => tool.name)).toEqual([
      "example-finance.itemsList",
      "example-finance.itemCreate",
      "example-finance.apiRequest",
    ]);
    expect(manifest.ui?.slots?.map((slot) => slot.exportName)).toContain("FinanceSettingsPage");
  });
});
