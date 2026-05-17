import type { LogisticsPlatformSpec } from "@kesarcloud/plugin-logistics-common";

export const spec: LogisticsPlatformSpec = {
  slug: "fedex",
  toolPrefix: "fedex",
  pluginId: "paperclaw.fedex",
  packageName: "@kesarcloud/plugin-fedex",
  displayName: "FedEx",
  description: "FedEx API connector for rates, shipments, labels, tracking, pickups, and address validation.",
  defaultBaseUrl: "https://apis.fedex.com",
  authKind: "bearer",
  docsUrl: "https://developer.fedex.com/api/en-us/home.html",
  setupNotes: "Create FedEx developer credentials, exchange them for an OAuth token, store the token as a PaperClaw secret, and test in sandbox before live label creation.",
  endpoints: {
    overview: { method: "GET", path: "/availability/v1/packageandserviceoptions" },
    carrierServices: { method: "GET", path: "/availability/v1/packageandserviceoptions" },
    rateQuote: { method: "POST", path: "/rate/v1/rates/quotes", mutating: false },
    shipmentCreate: { method: "POST", path: "/ship/v1/shipments", mutating: true },
    labelCreate: { method: "POST", path: "/ship/v1/shipments", mutating: true },
    trackingLookup: { method: "POST", path: "/track/v1/trackingnumbers", mutating: false },
    pickupCreate: { method: "POST", path: "/pickup/v1/pickups", mutating: true },
    pickupCancel: { method: "PUT", path: "/pickup/v1/pickups/cancel", mutating: true },
    addressValidate: { method: "POST", path: "/address/v1/addresses/resolve", mutating: false },
  },
};
