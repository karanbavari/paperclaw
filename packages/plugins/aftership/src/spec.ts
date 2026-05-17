import type { LogisticsPlatformSpec } from "@kesarcloud/plugin-logistics-common";

export const spec: LogisticsPlatformSpec = {
  slug: "aftership",
  toolPrefix: "aftership",
  pluginId: "paperclaw.aftership",
  packageName: "@kesarcloud/plugin-aftership",
  displayName: "AfterShip",
  description: "AfterShip Tracking API connector for carrier detection, tracking lookup, tracking creation, and webhooks.",
  defaultBaseUrl: "https://api.aftership.com/tracking/2024-04",
  authKind: "api-key-header",
  apiKeyHeaderName: "as-api-key",
  docsUrl: "https://www.aftership.com/docs/tracking/quickstart/api-quick-start",
  setupNotes: "Create an AfterShip API key, store it as a PaperClaw secret, and keep tracking creation in dry run until approved.",
  endpoints: {
    overview: { method: "GET", path: "/couriers" },
    carrierServices: { method: "GET", path: "/couriers" },
    shipmentCreate: { method: "POST", path: "/trackings", mutating: true },
    trackingLookup: { method: "GET", path: "/trackings/{trackingNumber}" },
  },
};
