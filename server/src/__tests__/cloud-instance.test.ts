import { describe, expect, it } from "vitest";
import {
  getCloudStackContext,
  isCloudManagedInstance,
  type CloudInstanceEnv,
} from "../services/cloud-instance.js";

describe("isCloudManagedInstance", () => {
  it("unifies both prior signals without weakening either restrictive floor", () => {
    const cases: CloudInstanceEnv[] = [
      {},
      { PAPERCLAW_CLOUD_TENANT_SERVER_TOKEN: "tenant-token" },
      { PAPERCLAW_MANAGED_CONFIG: "" },
      {
        PAPERCLAW_CLOUD_TENANT_SERVER_TOKEN: "tenant-token",
        PAPERCLAW_MANAGED_CONFIG: "managed-document",
      },
    ];

    for (const env of cases) {
      const priorTokenFloor = Boolean(env.PAPERCLAW_CLOUD_TENANT_SERVER_TOKEN?.trim());
      const priorManagedConfigFloor = env.PAPERCLAW_MANAGED_CONFIG !== undefined;
      const canonicalFloor = isCloudManagedInstance(env);

      expect(canonicalFloor).toBe(priorTokenFloor || priorManagedConfigFloor);
      expect(canonicalFloor || !priorTokenFloor).toBe(true);
      expect(canonicalFloor || !priorManagedConfigFloor).toBe(true);
    }
  });

  it("does not treat a blank tenant token alone as a managed signal", () => {
    expect(isCloudManagedInstance({ PAPERCLAW_CLOUD_TENANT_SERVER_TOKEN: "   " })).toBe(false);
  });
});

describe("getCloudStackContext", () => {
  it("returns null outside Paperclip Cloud even when stray stack metadata exists", () => {
    expect(getCloudStackContext({ PAPERCLAW_STACK_SLUG: "stray-stack" })).toBeNull();
  });

  it("returns normalized provisioner metadata for cloud instances", () => {
    expect(getCloudStackContext({
      PAPERCLAW_CLOUD_TENANT_SERVER_TOKEN: "tenant-token",
      PAPERCLAW_CLOUD_STACK_ID: " stack-1 ",
      PAPERCLAW_STACK_SLUG: " acme ",
      PAPERCLAW_CLOUD_ACCOUNT_GROUP_ID: " account-group-1 ",
      PAPERCLAW_PRIMARY_HOST: " acme.paperclaw.app ",
      PAPERCLAW_CLOUD_API_ORIGIN: " https://app.paperclaw.app ",
    })).toEqual({
      stackId: "stack-1",
      stackSlug: "acme",
      accountGroupId: "account-group-1",
      primaryHost: "acme.paperclaw.app",
      cloudOrigin: "https://app.paperclaw.app",
    });
  });

  it("represents missing managed metadata explicitly without failing health checks", () => {
    expect(getCloudStackContext({ PAPERCLAW_MANAGED_CONFIG: "managed-document" })).toEqual({
      stackId: null,
      stackSlug: null,
      accountGroupId: null,
      primaryHost: null,
      cloudOrigin: null,
    });
  });
});
