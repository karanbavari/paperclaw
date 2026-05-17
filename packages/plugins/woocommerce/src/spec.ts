import type { EcommercePlatformSpec } from "@kesarcloud/plugin-ecommerce-common";

export const spec: EcommercePlatformSpec = {
  slug: "woocommerce",
  toolPrefix: "woocommerce",
  pluginId: "paperclaw.woocommerce",
  packageName: "@kesarcloud/plugin-woocommerce",
  displayName: "WooCommerce",
  description: "WooCommerce REST API connector for products, inventory, orders, customers, and webhooks.",
  defaultBaseUrl: "https://example-store.com",
  authKind: "basic",
  docsUrl: "https://woocommerce.github.io/woocommerce-rest-api-docs/",
  setupNotes: "Create WooCommerce REST API keys in WordPress admin, store them as PaperClaw secrets, and keep dry run enabled until read tools succeed.",
  endpoints: {
    overview: { method: "GET", path: "/wp-json/wc/v3/system_status" },
    productsSearch: { method: "GET", path: "/wp-json/wc/v3/products", queryParam: "search" },
    productGet: { method: "GET", path: "/wp-json/wc/v3/products/{productId}" },
    productCreate: { method: "POST", path: "/wp-json/wc/v3/products", mutating: true },
    productUpdate: { method: "PUT", path: "/wp-json/wc/v3/products/{productId}", mutating: true },
    inventoryRead: { method: "GET", path: "/wp-json/wc/v3/products/{productId}" },
    inventoryUpdate: { method: "PUT", path: "/wp-json/wc/v3/products/{productId}", mutating: true },
    ordersSearch: { method: "GET", path: "/wp-json/wc/v3/orders", queryParam: "search" },
    orderGet: { method: "GET", path: "/wp-json/wc/v3/orders/{orderId}" },
    orderUpdate: { method: "PUT", path: "/wp-json/wc/v3/orders/{orderId}", mutating: true },
    customersSearch: { method: "GET", path: "/wp-json/wc/v3/customers", queryParam: "search" },
  },
};
