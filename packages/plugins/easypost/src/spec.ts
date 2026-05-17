import type { LogisticsPlatformSpec } from "@kesarcloud/plugin-logistics-common";

export const spec: LogisticsPlatformSpec = {
  slug: "easypost",
  toolPrefix: "easypost",
  pluginId: "paperclaw.easypost",
  packageName: "@kesarcloud/plugin-easypost",
  displayName: "EasyPost",
  description: "EasyPost API connector for rates, shipments, labels, tracking, pickups, and address verification.",
  defaultBaseUrl: "https://api.easypost.com/v2",
  authKind: "basic-api-key",
  docsUrl: "https://docs.easypost.com/docs",
  setupNotes: "Store your EasyPost API key as the API key secret reference. EasyPost uses the API key as the Basic Auth username.",
  endpoints: {
    overview: { method: "GET", path: "/carrier_accounts" },
    carrierServices: { method: "GET", path: "/carrier_accounts" },
    rateQuote: { method: "POST", path: "/shipments", mutating: false },
    shipmentCreate: { method: "POST", path: "/shipments", mutating: true },
    labelCreate: { method: "POST", path: "/shipments/{shipmentId}/buy", mutating: true },
    trackingLookup: { method: "GET", path: "/trackers/{trackingNumber}" },
    pickupCreate: { method: "POST", path: "/pickups", mutating: true },
    pickupCancel: { method: "DELETE", path: "/pickups/{pickupId}", mutating: true },
    addressValidate: { method: "POST", path: "/addresses", mutating: false },
  },
};
