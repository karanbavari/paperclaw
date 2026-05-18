import { describe, expect, it } from "vitest";
import { createRealEstateManifest, type RealEstateDefinition } from "./index.js";

const definition: RealEstateDefinition = {
  id: "paperclaw.example-real-estate",
  packageName: "@kesarcloud/plugin-example-real-estate",
  version: "0.1.0",
  displayName: "Example Real Estate",
  routePath: "example-real-estate",
  description: "Example real estate connector.",
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

describe("real estate core", () => {
  it("creates real estate manifests with tools and UI slots", () => {
    const manifest = createRealEstateManifest(definition);
    expect(manifest.categories).toContain("real-estate");
    expect(manifest.tools?.map((tool) => tool.name)).toEqual([
      "example-real-estate.itemsList",
      "example-real-estate.itemCreate",
      "example-real-estate.apiRequest",
    ]);
    expect(manifest.ui?.slots?.map((slot) => slot.exportName)).toContain("RealEstateSettingsPage");
  });
});
