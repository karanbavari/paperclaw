import type { EcommercePlatformSpec } from "@kesarcloud/plugin-ecommerce-common";

export const spec: EcommercePlatformSpec = {
  slug: "adobe-commerce",
  toolPrefix: "adobeCommerce",
  pluginId: "paperclaw.adobe-commerce",
  packageName: "@kesarcloud/plugin-adobe-commerce",
  displayName: "Adobe Commerce",
  description: "Adobe Commerce and Magento REST API connector for catalog, inventory, orders, customers, and store operations.",
  defaultBaseUrl: "https://example-store.com",
  authKind: "bearer",
  docsUrl: "https://developer.adobe.com/commerce/webapi/rest/reference/",
  setupNotes: "Create an Adobe Commerce integration token, store it as a PaperClaw secret, and set Store / Project ID to default or your store view code.",
  endpoints: {
    overview: { method: "GET", path: "/rest/{storeId}/V1/store/storeConfigs" },
    productsSearch: { method: "GET", path: "/rest/{storeId}/V1/products", queryParam: "searchCriteria[filter_groups][0][filters][0][value]" },
    productGet: { method: "GET", path: "/rest/{storeId}/V1/products/{productId}" },
    productCreate: { method: "POST", path: "/rest/{storeId}/V1/products", mutating: true },
    productUpdate: { method: "PUT", path: "/rest/{storeId}/V1/products/{productId}", mutating: true },
    inventoryRead: { method: "GET", path: "/rest/{storeId}/V1/stockItems/{productId}" },
    inventoryUpdate: { method: "PUT", path: "/rest/{storeId}/V1/products/{productId}/stockItems/1", mutating: true },
    ordersSearch: { method: "GET", path: "/rest/{storeId}/V1/orders" },
    orderGet: { method: "GET", path: "/rest/{storeId}/V1/orders/{orderId}" },
    orderUpdate: { method: "POST", path: "/rest/{storeId}/V1/orders/{orderId}/comments", mutating: true },
    customersSearch: { method: "GET", path: "/rest/{storeId}/V1/customers/search" },
  },
};
