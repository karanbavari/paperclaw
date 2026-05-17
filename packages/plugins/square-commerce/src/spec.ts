import type { EcommercePlatformSpec } from "@kesarcloud/plugin-ecommerce-common";

export const spec: EcommercePlatformSpec = {
  slug: "square-commerce",
  toolPrefix: "squareCommerce",
  pluginId: "paperclaw.square-commerce",
  packageName: "@kesarcloud/plugin-square-commerce",
  displayName: "Square Commerce",
  description: "Square API connector for catalog, inventory, orders, customers, and webhook-ready commerce operations.",
  defaultBaseUrl: "https://connect.squareup.com",
  defaultApiVersion: "2026-04-16",
  authKind: "bearer",
  docsUrl: "https://developer.squareup.com/docs/",
  setupNotes: "Create a Square application, store an access token secret reference, and use sandbox credentials before live mode.",
  endpoints: {
    overview: { method: "GET", path: "/v2/locations" },
    productsSearch: { method: "GET", path: "/v2/catalog/list", queryParam: "types" },
    productGet: { method: "GET", path: "/v2/catalog/object/{productId}" },
    productCreate: { method: "POST", path: "/v2/catalog/object", mutating: true },
    productUpdate: { method: "POST", path: "/v2/catalog/object", mutating: true },
    inventoryRead: { method: "GET", path: "/v2/inventory/{productId}" },
    inventoryUpdate: { method: "POST", path: "/v2/inventory/changes/batch-create", mutating: true },
    ordersSearch: { method: "POST", path: "/v2/orders/search", mutating: false },
    orderGet: { method: "GET", path: "/v2/orders/{orderId}" },
    orderUpdate: { method: "PUT", path: "/v2/orders/{orderId}", mutating: true },
    customersSearch: { method: "GET", path: "/v2/customers", queryParam: "query" },
  },
};
