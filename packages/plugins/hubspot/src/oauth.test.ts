import { describe, expect, it } from "vitest";
import { createHubSpotAuthorizationUrl } from "./oauth.js";

describe("HubSpot OAuth helpers", () => {
  it("builds an authorization URL with requested scopes", () => {
    const url = new URL(createHubSpotAuthorizationUrl({
      clientId: "client-1",
      redirectUri: "https://paperclaw.example/plugins/hubspot",
      state: "state-1",
      scopes: ["crm.objects.contacts.read", "crm.objects.contacts.write"],
    }));

    expect(url.origin + url.pathname).toBe("https://app.hubspot.com/oauth/authorize");
    expect(url.searchParams.get("client_id")).toBe("client-1");
    expect(url.searchParams.get("redirect_uri")).toBe("https://paperclaw.example/plugins/hubspot");
    expect(url.searchParams.get("scope")).toBe("crm.objects.contacts.read crm.objects.contacts.write");
    expect(url.searchParams.get("state")).toBe("state-1");
  });
});
