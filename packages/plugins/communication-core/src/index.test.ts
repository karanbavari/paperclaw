import { describe, expect, it } from "vitest";
import { createCommunicationManifest, type CommunicationDefinition } from "./index.js";

const definition: CommunicationDefinition = {
  id: "paperclaw.example-communication",
  packageName: "@kesarcloud/plugin-example-communication",
  version: "0.1.0",
  displayName: "Example Communication",
  routePath: "example-communication",
  description: "Example communication connector.",
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

describe("communication core", () => {
  it("creates communication manifests with tools and UI slots", () => {
    const manifest = createCommunicationManifest(definition);
    expect(manifest.categories).toContain("communication");
    expect(manifest.tools?.map((tool) => tool.name)).toEqual([
      "example-communication.itemsList",
      "example-communication.itemCreate",
      "example-communication.apiRequest",
    ]);
    expect(manifest.ui?.slots?.map((slot) => slot.exportName)).toContain("CommunicationSettingsPage");
  });
});
