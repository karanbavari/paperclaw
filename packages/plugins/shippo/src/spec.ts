import type { LogisticsPlatformSpec } from "@kesarcloud/plugin-logistics-common";

export const spec: LogisticsPlatformSpec = {
  slug: "shippo",
  toolPrefix: "shippo",
  pluginId: "paperclaw.shippo",
  packageName: "@kesarcloud/plugin-shippo",
  displayName: "Shippo",
  description: "Shippo API connector for rates, shipments, labels, tracking, address validation, and carrier services.",
  defaultBaseUrl: "https://api.goshippo.com",
  authKind: "bearer",
  docsUrl: "https://docs.goshippo.com/shippoapi/public-api/",
  setupNotes: "Create a Shippo API token, store it as a PaperClaw secret, and keep dry run enabled before purchasing labels.",
  endpoints: {
    overview: { method: "GET", path: "/carrier_accounts" },
    carrierServices: { method: "GET", path: "/carrier_accounts" },
    rateQuote: { method: "POST", path: "/shipments", mutating: false },
    shipmentCreate: { method: "POST", path: "/shipments", mutating: true },
    labelCreate: { method: "POST", path: "/transactions", mutating: true },
    trackingLookup: { method: "GET", path: "/tracks/{trackingNumber}" },
    addressValidate: { method: "POST", path: "/addresses", mutating: false },
  },
};
