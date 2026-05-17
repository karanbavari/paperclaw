import type { EcommercePlatformSpec } from "@kesarcloud/plugin-ecommerce-common";

export const spec: EcommercePlatformSpec = {
  slug: "commercetools",
  toolPrefix: "commercetools",
  pluginId: "paperclaw.commercetools",
  packageName: "@kesarcloud/plugin-commercetools",
  displayName: "commercetools",
  description: "commercetools HTTP API connector for products, inventory, orders, customers, and project operations.",
  defaultBaseUrl: "https://api.europe-west1.gcp.commercetools.com",
  authKind: "bearer",
  docsUrl: "https://docs.commercetools.com/api/general-concepts",
  setupNotes: "Create commercetools API credentials, exchange them for an access token, store the token as a PaperClaw secret, and set Store / Project ID to the project key.",
  endpoints: {
    overview: { method: "GET", path: "/{storeId}" },
    productsSearch: { method: "GET", path: "/{storeId}/products", queryParam: "text.en" },
    productGet: { method: "GET", path: "/{storeId}/products/{productId}" },
    productCreate: { method: "POST", path: "/{storeId}/products", mutating: true },
    productUpdate: { method: "POST", path: "/{storeId}/products/{productId}", mutating: true },
    inventoryRead: { method: "GET", path: "/{storeId}/inventory", queryParam: "where" },
    inventoryUpdate: { method: "POST", path: "/{storeId}/inventory", mutating: true },
    ordersSearch: { method: "GET", path: "/{storeId}/orders", queryParam: "where" },
    orderGet: { method: "GET", path: "/{storeId}/orders/{orderId}" },
    orderUpdate: { method: "POST", path: "/{storeId}/orders/{orderId}", mutating: true },
    customersSearch: { method: "GET", path: "/{storeId}/customers", queryParam: "where" },
  },
};
