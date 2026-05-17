import type { EcommercePlatformSpec } from "@kesarcloud/plugin-ecommerce-common";

export const spec: EcommercePlatformSpec = {
  slug: "ecwid",
  toolPrefix: "ecwid",
  pluginId: "paperclaw.ecwid",
  packageName: "@kesarcloud/plugin-ecwid",
  displayName: "Ecwid",
  description: "Ecwid REST API connector for products, inventory, orders, customers, and store operations.",
  defaultBaseUrl: "https://app.ecwid.com/api/v3",
  authKind: "bearer",
  docsUrl: "https://docs.ecwid.com/api-reference/",
  setupNotes: "Create an Ecwid app token, store it as a PaperClaw secret, and set Store / Project ID to the Ecwid store ID.",
  endpoints: {
    overview: { method: "GET", path: "/{storeId}/profile" },
    productsSearch: { method: "GET", path: "/{storeId}/products", queryParam: "keyword" },
    productGet: { method: "GET", path: "/{storeId}/products/{productId}" },
    productCreate: { method: "POST", path: "/{storeId}/products", mutating: true },
    productUpdate: { method: "PUT", path: "/{storeId}/products/{productId}", mutating: true },
    inventoryRead: { method: "GET", path: "/{storeId}/products/{productId}" },
    inventoryUpdate: { method: "PUT", path: "/{storeId}/products/{productId}", mutating: true },
    ordersSearch: { method: "GET", path: "/{storeId}/orders", queryParam: "keywords" },
    orderGet: { method: "GET", path: "/{storeId}/orders/{orderId}" },
    orderUpdate: { method: "PUT", path: "/{storeId}/orders/{orderId}", mutating: true },
    customersSearch: { method: "GET", path: "/{storeId}/customers", queryParam: "keyword" },
  },
};
