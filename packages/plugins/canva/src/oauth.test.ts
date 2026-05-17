import { describe, expect, it } from "vitest";
import { createCanvaAuthorizationUrl, createCodeChallenge } from "./oauth.js";

describe("Canva OAuth helpers", () => {
  it("builds a Canva authorization URL with PKCE parameters", () => {
    const codeVerifier = "a".repeat(64);
    const authorizationUrl = createCanvaAuthorizationUrl({
      clientId: "client-123",
      redirectUri: "https://paperclaw.example/acme/canva",
      codeVerifier,
      state: "state-123",
      scopes: ["design:meta:read", "profile:read"],
    });

    const url = new URL(authorizationUrl);
    expect(url.origin + url.pathname).toBe("https://www.canva.com/api/oauth/authorize");
    expect(url.searchParams.get("client_id")).toBe("client-123");
    expect(url.searchParams.get("redirect_uri")).toBe("https://paperclaw.example/acme/canva");
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
    expect(url.searchParams.get("code_challenge")).toBe(createCodeChallenge(codeVerifier));
    expect(url.searchParams.get("scope")).toBe("design:meta:read profile:read");
    expect(url.searchParams.get("state")).toBe("state-123");
  });
});
