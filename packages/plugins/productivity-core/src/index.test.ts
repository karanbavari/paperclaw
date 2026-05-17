import { describe, expect, it } from "vitest";
import { createProductivityManifest, type ProductivityDefinition } from "./index.js";

const definition: ProductivityDefinition = {
  id: "paperclaw.example-productivity",
  packageName: "@kesarcloud/plugin-example-productivity",
  version: "0.1.0",
  displayName: "Example Productivity",
  routePath: "example-productivity",
  description: "Example productivity connector.",
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

describe("productivity core", () => {
  it("creates productivity manifests with tools and UI slots", () => {
    const manifest = createProductivityManifest(definition);
    expect(manifest.categories).toContain("productivity");
    expect(manifest.tools?.map((tool) => tool.name)).toEqual([
      "example-productivity.itemsList",
      "example-productivity.itemCreate",
      "example-productivity.apiRequest",
    ]);
    expect(manifest.ui?.slots?.map((slot) => slot.exportName)).toContain("ProductivitySettingsPage");
  });
});
