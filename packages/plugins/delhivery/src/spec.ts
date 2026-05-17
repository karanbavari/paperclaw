import type { LogisticsPlatformSpec } from "@kesarcloud/plugin-logistics-common";

export const spec: LogisticsPlatformSpec = {
  slug: "delhivery",
  toolPrefix: "delhivery",
  pluginId: "paperclaw.delhivery",
  packageName: "@kesarcloud/plugin-delhivery",
  displayName: "Delhivery",
  description: "Delhivery API connector for Indian ecommerce shipments, waybills, labels, tracking, pickups, and serviceability.",
  defaultBaseUrl: "https://track.delhivery.com",
  authKind: "api-key-header",
  apiKeyHeaderName: "Authorization",
  docsUrl: "https://delhivery-express-api-doc.readme.io/",
  setupNotes: "Create Delhivery API credentials, store the token as a PaperClaw secret, and keep shipment and pickup tools in dry run until approved.",
  endpoints: {
    overview: { method: "GET", path: "/api/kinko/v1/invoice/charges/.json" },
    carrierServices: { method: "GET", path: "/c/api/pin-codes/json/" },
    rateQuote: { method: "GET", path: "/api/kinko/v1/invoice/charges/.json" },
    shipmentCreate: { method: "POST", path: "/api/cmu/create.json", mutating: true },
    labelCreate: { method: "GET", path: "/api/p/packing_slip" },
    trackingLookup: { method: "GET", path: "/api/v1/packages/json/", queryParam: "waybill" },
    pickupCreate: { method: "POST", path: "/fm/request/new/", mutating: true },
    pickupCancel: { method: "POST", path: "/fm/request/cancel/", mutating: true },
    addressValidate: { method: "GET", path: "/c/api/pin-codes/json/", queryParam: "filter_codes" },
  },
};
