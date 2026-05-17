import type { LogisticsPlatformSpec } from "@kesarcloud/plugin-logistics-common";

export const spec: LogisticsPlatformSpec = {
  slug: "ups",
  toolPrefix: "ups",
  pluginId: "paperclaw.ups",
  packageName: "@kesarcloud/plugin-ups",
  displayName: "UPS",
  description: "UPS API connector for rating, shipping, labels, tracking, pickup, and address validation.",
  defaultBaseUrl: "https://onlinetools.ups.com",
  authKind: "bearer",
  docsUrl: "https://developer.ups.com/",
  setupNotes: "Create UPS developer credentials, store an OAuth access token as a PaperClaw secret, and keep label and pickup tools in dry run until approved.",
  endpoints: {
    overview: { method: "GET", path: "/api/shipments/v1/pickup-options" },
    carrierServices: { method: "GET", path: "/api/shipments/v1/pickup-options" },
    rateQuote: { method: "POST", path: "/api/rating/v1/Rate", mutating: false },
    shipmentCreate: { method: "POST", path: "/api/shipments/v1/ship", mutating: true },
    labelCreate: { method: "POST", path: "/api/shipments/v1/ship", mutating: true },
    trackingLookup: { method: "GET", path: "/api/track/v1/details/{trackingNumber}" },
    pickupCreate: { method: "POST", path: "/api/shipments/v1/pickup", mutating: true },
    pickupCancel: { method: "DELETE", path: "/api/shipments/v1/pickup/{pickupId}", mutating: true },
    addressValidate: { method: "POST", path: "/api/addressvalidation/v1/1", mutating: false },
  },
};
