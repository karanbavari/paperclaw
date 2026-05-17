import type { LogisticsPlatformSpec } from "@kesarcloud/plugin-logistics-common";

export const spec: LogisticsPlatformSpec = {
  slug: "shipengine",
  toolPrefix: "shipengine",
  pluginId: "paperclaw.shipengine",
  packageName: "@kesarcloud/plugin-shipengine",
  displayName: "ShipEngine",
  description: "ShipEngine API connector for carriers, rates, shipments, labels, tracking, and address validation.",
  defaultBaseUrl: "https://api.shipengine.com/v1",
  authKind: "api-key-header",
  apiKeyHeaderName: "api-key",
  docsUrl: "https://www.shipengine.com/docs/",
  setupNotes: "Create a ShipEngine API key, store it as a PaperClaw secret, and keep label creation in dry run until approved.",
  endpoints: {
    overview: { method: "GET", path: "/carriers" },
    carrierServices: { method: "GET", path: "/carriers" },
    rateQuote: { method: "POST", path: "/rates", mutating: false },
    shipmentCreate: { method: "POST", path: "/shipments", mutating: true },
    labelCreate: { method: "POST", path: "/labels", mutating: true },
    trackingLookup: { method: "GET", path: "/tracking", queryParam: "tracking_number" },
    addressValidate: { method: "POST", path: "/addresses/validate", mutating: false },
  },
};
