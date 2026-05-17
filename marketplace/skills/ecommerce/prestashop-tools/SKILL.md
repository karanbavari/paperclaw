# PrestaShop Tools

Use this skill when a PaperClaw agent needs to inspect or operate a PrestaShop store through the PrestaShop plugin.

## Before Using Tools

1. Confirm PrestaShop Webservice is enabled.
2. Store the webservice key as a PaperClaw secret and configure the plugin base URL.
3. Use read tools before changing products, stock, orders, or customers.
4. Keep dry-run enabled for writes until the XML/REST payload is reviewed.

## Guardrails

- Never ask for the webservice key in chat.
- PrestaShop payloads can be strict; if validation fails, report the exact field/error and stop.
- Avoid exposing unnecessary customer/order data.
