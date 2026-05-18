import { describe, expect, it } from "vitest";
import { createDeveloperManifest, type DeveloperDefinition } from "./index.js";

const definition: DeveloperDefinition = {
  id: "paperclaw.example-developer",
  packageName: "@kesarcloud/plugin-example-developer",
  version: "0.1.0",
  displayName: "Example Developer",
  routePath: "example-developer",
  description: "Example developer connector.",
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

describe("developer core", () => {
  it("creates developer manifests with tools and UI slots", () => {
    const manifest = createDeveloperManifest(definition);
    expect(manifest.categories).toContain("developer");
    expect(manifest.tools?.map((tool) => tool.name)).toEqual([
      "example-developer.itemsList",
      "example-developer.itemCreate",
      "example-developer.apiRequest",
    ]);
    expect(manifest.ui?.slots?.map((slot) => slot.exportName)).toContain("DeveloperSettingsPage");
  });
});
