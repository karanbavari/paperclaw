import type { LogisticsPlatformSpec } from "@kesarcloud/plugin-logistics-common";

export const spec: LogisticsPlatformSpec = {
  slug: "usps",
  toolPrefix: "usps",
  pluginId: "paperclaw.usps",
  packageName: "@kesarcloud/plugin-usps",
  displayName: "USPS",
  description: "USPS API connector for prices, labels, tracking, carrier pickup, and address verification.",
  defaultBaseUrl: "https://apis.usps.com",
  authKind: "bearer",
  docsUrl: "https://developer.usps.com/",
  setupNotes: "Create USPS developer credentials, store an OAuth token as a PaperClaw secret, and test prices/tracking before live label generation.",
  endpoints: {
    overview: { method: "GET", path: "/addresses/v3/city-state" },
    carrierServices: { method: "GET", path: "/prices/v3/base-rates/search" },
    rateQuote: { method: "POST", path: "/prices/v3/base-rates/search", mutating: false },
    shipmentCreate: { method: "POST", path: "/labels/v3/label", mutating: true },
    labelCreate: { method: "POST", path: "/labels/v3/label", mutating: true },
    trackingLookup: { method: "GET", path: "/tracking/v3/tracking/{trackingNumber}" },
    pickupCreate: { method: "POST", path: "/pickup/v3/carrier-pickup", mutating: true },
    pickupCancel: { method: "DELETE", path: "/pickup/v3/carrier-pickup/{pickupId}", mutating: true },
    addressValidate: { method: "GET", path: "/addresses/v3/address" },
  },
};
