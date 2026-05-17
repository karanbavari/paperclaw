import type { EcommercePlatformSpec } from "@kesarcloud/plugin-ecommerce-common";

export const spec: EcommercePlatformSpec = {
  slug: "prestashop",
  toolPrefix: "prestashop",
  pluginId: "paperclaw.prestashop",
  packageName: "@kesarcloud/plugin-prestashop",
  displayName: "PrestaShop",
  description: "PrestaShop Webservice API connector for products, stock, orders, customers, and store operations.",
  defaultBaseUrl: "https://example-store.com",
  authKind: "basic",
  docsUrl: "https://devdocs.prestashop-project.org/9/webservice/",
  setupNotes: "Enable PrestaShop Webservice, store the webservice key as API Key Secret Reference, and keep dry run enabled for first tests.",
  endpoints: {
    overview: { method: "GET", path: "/api/shop_urls" },
    productsSearch: { method: "GET", path: "/api/products", queryParam: "filter[name]" },
    productGet: { method: "GET", path: "/api/products/{productId}" },
    productCreate: { method: "POST", path: "/api/products", mutating: true },
    productUpdate: { method: "PUT", path: "/api/products/{productId}", mutating: true },
    inventoryRead: { method: "GET", path: "/api/stock_availables", queryParam: "filter[id_product]" },
    inventoryUpdate: { method: "PUT", path: "/api/stock_availables/{productId}", mutating: true },
    ordersSearch: { method: "GET", path: "/api/orders" },
    orderGet: { method: "GET", path: "/api/orders/{orderId}" },
    orderUpdate: { method: "PUT", path: "/api/orders/{orderId}", mutating: true },
    customersSearch: { method: "GET", path: "/api/customers", queryParam: "filter[email]" },
  },
};
