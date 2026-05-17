import type { EcommercePlatformSpec } from "@kesarcloud/plugin-ecommerce-common";

export const spec: EcommercePlatformSpec = {
  slug: "wix-ecommerce",
  toolPrefix: "wixEcommerce",
  pluginId: "paperclaw.wix-ecommerce",
  packageName: "@kesarcloud/plugin-wix-ecommerce",
  displayName: "Wix eCommerce",
  description: "Wix eCommerce API connector for products, inventory, orders, customers, and storefront operations.",
  defaultBaseUrl: "https://www.wixapis.com",
  authKind: "bearer",
  docsUrl: "https://dev.wix.com/docs/rest/api-reference/wix-e-commerce/orders/introduction",
  setupNotes: "Create a Wix app or API key, store the OAuth/access token as a PaperClaw secret, and test read tools before enabling live mutations.",
  endpoints: {
    overview: { method: "GET", path: "/site-properties/v4/properties" },
    productsSearch: { method: "POST", path: "/stores/v1/products/query", mutating: false },
    productGet: { method: "GET", path: "/stores/v1/products/{productId}" },
    productCreate: { method: "POST", path: "/stores/v1/products", mutating: true },
    productUpdate: { method: "PATCH", path: "/stores/v1/products/{productId}", mutating: true },
    inventoryRead: { method: "POST", path: "/stores/v2/inventoryItems/query", mutating: false },
    inventoryUpdate: { method: "PATCH", path: "/stores/v2/inventoryItems/{productId}", mutating: true },
    ordersSearch: { method: "POST", path: "/ecom/v1/orders/search", mutating: false },
    orderGet: { method: "GET", path: "/ecom/v1/orders/{orderId}" },
    orderUpdate: { method: "PATCH", path: "/ecom/v1/orders/{orderId}", mutating: true },
    customersSearch: { method: "POST", path: "/contacts/v4/contacts/query", mutating: false },
  },
};
