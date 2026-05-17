import { createHash, randomBytes } from "node:crypto";
import { DEFAULT_SCOPES } from "./constants.js";

const AUTH_URL = "https://www.canva.com/api/oauth/authorize";

function base64Url(input: Buffer) {
  return input
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function createCodeVerifier() {
  return base64Url(randomBytes(64));
}

export function createCodeChallenge(codeVerifier: string) {
  return base64Url(createHash("sha256").update(codeVerifier).digest());
}

export function createOauthState() {
  return base64Url(randomBytes(24));
}

export function createCanvaAuthorizationUrl(input: {
  clientId: string;
  redirectUri: string;
  codeVerifier: string;
  state: string;
  scopes?: string[];
}) {
  const url = new URL(AUTH_URL);
  url.searchParams.set("client_id", input.clientId);
  url.searchParams.set("redirect_uri", input.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("code_challenge", createCodeChallenge(input.codeVerifier));
  url.searchParams.set("scope", (input.scopes?.length ? input.scopes : [...DEFAULT_SCOPES]).join(" "));
  url.searchParams.set("state", input.state);
  return url.toString();
}
