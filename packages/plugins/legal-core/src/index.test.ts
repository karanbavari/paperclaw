import { describe, expect, it } from "vitest";
import { createLegalManifest, type LegalDefinition } from "./index.js";

const definition: LegalDefinition = {
  id: "paperclaw.example-legal",
  packageName: "@kesarcloud/plugin-example-legal",
  version: "0.1.0",
  displayName: "Example Legal",
  routePath: "example-legal",
  description: "Example legal connector.",
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

describe("legal core", () => {
  it("creates legal manifests with tools and UI slots", () => {
    const manifest = createLegalManifest(definition);
    expect(manifest.categories).toContain("legal_law");
    expect(manifest.tools?.map((tool) => tool.name)).toEqual([
      "example-legal.itemsList",
      "example-legal.itemCreate",
      "example-legal.apiRequest",
    ]);
    expect(manifest.ui?.slots?.map((slot) => slot.exportName)).toContain("LegalSettingsPage");
  });
});
