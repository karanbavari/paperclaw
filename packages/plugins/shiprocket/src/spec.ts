import type { LogisticsPlatformSpec } from "@kesarcloud/plugin-logistics-common";

export const spec: LogisticsPlatformSpec = {
  slug: "shiprocket",
  toolPrefix: "shiprocket",
  pluginId: "paperclaw.shiprocket",
  packageName: "@kesarcloud/plugin-shiprocket",
  displayName: "Shiprocket",
  description: "Shiprocket API connector for couriers, rates, orders, AWB labels, pickups, tracking, and serviceability.",
  defaultBaseUrl: "https://apiv2.shiprocket.in/v1/external",
  authKind: "bearer",
  docsUrl: "https://apidocs.shiprocket.in/",
  setupNotes: "Create a Shiprocket API token, store it as a PaperClaw secret, and keep order/AWB/pickup tools in dry run until approved.",
  endpoints: {
    overview: { method: "GET", path: "/courier/courierListWithCounts" },
    carrierServices: { method: "GET", path: "/courier/courierListWithCounts" },
    rateQuote: { method: "GET", path: "/courier/serviceability/" },
    shipmentCreate: { method: "POST", path: "/orders/create/adhoc", mutating: true },
    labelCreate: { method: "POST", path: "/courier/generate/label", mutating: true },
    trackingLookup: { method: "GET", path: "/courier/track/awb/{trackingNumber}" },
    pickupCreate: { method: "POST", path: "/courier/generate/pickup", mutating: true },
    pickupCancel: { method: "POST", path: "/orders/cancel", mutating: true },
    addressValidate: { method: "GET", path: "/courier/serviceability/", queryParam: "pickup_postcode" },
  },
};
