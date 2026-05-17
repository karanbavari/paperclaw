# Adobe Commerce Tools

Use this skill when a PaperClaw agent needs to inspect or operate an Adobe Commerce or Magento store through the Adobe Commerce plugin.

## Before Using Tools

1. Confirm the plugin base URL points to the correct Commerce instance.
2. Confirm Store / Project ID is `default` or the intended store view code.
3. Use read tools before changing products, stock, orders, or customers.
4. Keep dry-run enabled for writes until the exact REST operation is reviewed.

## Guardrails

- Never ask for admin integration tokens in chat.
- State SKU/product/order identifiers before live writes.
- Magento REST payloads are strict; stop and report validation errors rather than retrying blindly.
