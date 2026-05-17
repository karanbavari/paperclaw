# WooCommerce Tools

Use this skill when a PaperClaw agent needs to inspect or operate a WooCommerce store through the WooCommerce plugin.

## Before Using Tools

1. Confirm the plugin is installed and configured with the store base URL and WooCommerce REST API secrets.
2. Use read tools first: `woocommerce.storeOverview`, `woocommerce.productsSearch`, `woocommerce.productGet`, `woocommerce.ordersSearch`, and `woocommerce.orderGet`.
3. Keep `dryRun` enabled for product, inventory, order, and customer mutations until a board-approved live change is required.

## Guardrails

- Never ask for consumer keys or secrets in chat.
- For live mutations, state the exact product, inventory, order, or customer field that will change.
- Keep order/customer outputs concise and avoid unnecessary personal data.
- If WooCommerce returns validation errors, report the field/message and stop.
