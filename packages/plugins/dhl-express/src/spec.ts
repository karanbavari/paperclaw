import type { LogisticsPlatformSpec } from "@kesarcloud/plugin-logistics-common";

export const spec: LogisticsPlatformSpec = {
  slug: "dhl-express",
  toolPrefix: "dhlExpress",
  pluginId: "paperclaw.dhl-express",
  packageName: "@kesarcloud/plugin-dhl-express",
  displayName: "DHL Express",
  description: "DHL Express API connector for rates, shipments, labels, pickups, tracking, and address validation.",
  defaultBaseUrl: "https://express.api.dhl.com/mydhlapi",
  authKind: "basic",
  docsUrl: "https://developer.dhl.com/api-reference/dhl-express-mydhl-api",
  setupNotes: "Create DHL Express MyDHL API credentials, store them as PaperClaw secret references, and keep shipment tools in dry run until approved.",
  endpoints: {
    overview: { method: "GET", path: "/rates" },
    carrierServices: { method: "GET", path: "/rates" },
    rateQuote: { method: "GET", path: "/rates" },
    shipmentCreate: { method: "POST", path: "/shipments", mutating: true },
    labelCreate: { method: "POST", path: "/shipments", mutating: true },
    trackingLookup: { method: "GET", path: "/shipments/{trackingNumber}/tracking" },
    pickupCreate: { method: "POST", path: "/pickups", mutating: true },
    pickupCancel: { method: "DELETE", path: "/pickups/{pickupId}", mutating: true },
    addressValidate: { method: "GET", path: "/address-validate" },
  },
};
