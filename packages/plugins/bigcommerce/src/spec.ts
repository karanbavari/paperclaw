import type { EcommercePlatformSpec } from "@kesarcloud/plugin-ecommerce-common";

export const spec: EcommercePlatformSpec = {
  slug: "bigcommerce",
  toolPrefix: "bigcommerce",
  pluginId: "paperclaw.bigcommerce",
  packageName: "@kesarcloud/plugin-bigcommerce",
  displayName: "BigCommerce",
  description: "BigCommerce Admin API connector for catalog, inventory, orders, customers, and webhooks.",
  defaultBaseUrl: "https://api.bigcommerce.com",
  authKind: "api-key-header",
  apiKeyHeaderName: "x-auth-token",
  docsUrl: "https://docs.bigcommerce.com/developer/api-reference/rest/admin/overview",
  setupNotes: "Create a BigCommerce API account, set store hash as Store / Project ID, and store the access token as a PaperClaw secret.",
  endpoints: {
    overview: { method: "GET", path: "/stores/{storeId}/v2/store" },
    productsSearch: { method: "GET", path: "/stores/{storeId}/v3/catalog/products", queryParam: "keyword" },
    productGet: { method: "GET", path: "/stores/{storeId}/v3/catalog/products/{productId}" },
    productCreate: { method: "POST", path: "/stores/{storeId}/v3/catalog/products", mutating: true },
    productUpdate: { method: "PUT", path: "/stores/{storeId}/v3/catalog/products/{productId}", mutating: true },
    inventoryRead: { method: "GET", path: "/stores/{storeId}/v3/catalog/products/{productId}" },
    inventoryUpdate: { method: "PUT", path: "/stores/{storeId}/v3/catalog/products/{productId}", mutating: true },
    ordersSearch: { method: "GET", path: "/stores/{storeId}/v2/orders" },
    orderGet: { method: "GET", path: "/stores/{storeId}/v2/orders/{orderId}" },
    orderUpdate: { method: "PUT", path: "/stores/{storeId}/v2/orders/{orderId}", mutating: true },
    customersSearch: { method: "GET", path: "/stores/{storeId}/v3/customers", queryParam: "keyword" },
  },
};
