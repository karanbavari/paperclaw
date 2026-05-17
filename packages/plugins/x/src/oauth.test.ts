import { describe, expect, it } from "vitest";
import { createCodeChallenge, createXAuthorizationUrl } from "./oauth.js";

describe("X OAuth helpers", () => {
  it("creates a deterministic S256 PKCE challenge", () => {
    expect(createCodeChallenge("plain-verifier")).toBe("IjWSa8MQqkWaM2dlqUYp93f_cwbou6vghULjSbeISuk");
  });

  it("builds an authorization URL with requested scopes", () => {
    const url = new URL(createXAuthorizationUrl({
      clientId: "client-1",
      redirectUri: "https://paperclaw.example/plugins/x",
      codeVerifier: "plain-verifier",
      state: "state-1",
      scopes: ["offline.access", "tweet.read", "tweet.write"],
    }));

    expect(url.origin + url.pathname).toBe("https://x.com/i/oauth2/authorize");
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("client_id")).toBe("client-1");
    expect(url.searchParams.get("redirect_uri")).toBe("https://paperclaw.example/plugins/x");
    expect(url.searchParams.get("scope")).toBe("offline.access tweet.read tweet.write");
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
    expect(url.searchParams.get("code_challenge")).toBe("IjWSa8MQqkWaM2dlqUYp93f_cwbou6vghULjSbeISuk");
  });
});
