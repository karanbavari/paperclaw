# Shopify Tools

Use this skill when a PaperClaw agent needs to inspect or operate a Shopify store through the Shopify plugin.

## Before Using Tools

1. Confirm the Shopify plugin is installed and configured.
2. Confirm the target shop is connected by OAuth.
3. Prefer dry-run for any create, update, inventory, page, or webhook action unless the issue explicitly asks for live execution.
4. Use the least powerful tool that completes the work. Search or read before mutating.

## Tool Protocol

- Use `shopify.shopOverview` first when you need to verify store access, scopes, currency, or plan context.
- Use `shopify.productsSearch` before product updates so you can identify the exact product gid.
- Use `shopify.productGet` before changing a product so you can compare current state with the requested change.
- Use `shopify.ordersSearch` and `shopify.orderGet` for order support, fulfillment investigation, and reporting.
- Use `shopify.inventoryLevels` before `shopify.inventoryAdjust`.
- Use `shopify.pageCreateOrUpdate` for Online Store page content only after the content is ready.
- Use `shopify.webhookSubscriptionsList` before `shopify.webhookSubscribe`.
- Use `shopify.runGraphql` only when the curated tools cannot answer the request and the plugin setting explicitly enables raw GraphQL.

## Guardrails

- Never ask the user for a Shopify access token in chat. The plugin stores tokens as PaperClaw company secrets after OAuth.
- For live mutations, state exactly what will change before running the tool.
- Respect shop allowlists and operation allowlists. If blocked, report the missing permission or setup action.
- Keep outputs concise. Summarize products, orders, and inventory instead of dumping full payloads.

## Handoff Notes

When a Shopify task is complete, comment with the shop domain, tools used, dry-run/live mode, concrete result, and next action.
