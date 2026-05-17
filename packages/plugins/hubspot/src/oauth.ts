import { randomBytes } from "node:crypto";
import { DEFAULT_SCOPES } from "./constants.js";

const AUTH_URL = "https://app.hubspot.com/oauth/authorize";

function base64Url(input: Buffer) {
  return input
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function createOauthState() {
  return base64Url(randomBytes(24));
}

export function createHubSpotAuthorizationUrl(input: {
  clientId: string;
  redirectUri: string;
  state: string;
  scopes?: string[];
}) {
  const url = new URL(AUTH_URL);
  url.searchParams.set("client_id", input.clientId);
  url.searchParams.set("redirect_uri", input.redirectUri);
  url.searchParams.set("scope", (input.scopes?.length ? input.scopes : [...DEFAULT_SCOPES]).join(" "));
  url.searchParams.set("state", input.state);
  return url.toString();
}
