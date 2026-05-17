# @kesarcloud/plugin-stripe

First-party PaperClaw plugin that gives agents a governed Stripe merchant payment tool surface.

## Setup

1. Create a Stripe secret or restricted API key.
2. Store the key in PaperClaw secrets.
3. Configure the plugin with:
   - Stripe secret key reference
   - webhook signing secret reference
   - mode label, usually `test` or `live`
4. Configure Stripe webhooks to point at:

   ```text
   https://YOUR-PAPERCLAW-HOST/api/plugins/paperclaw.stripe/webhooks/stripe
   ```

Stripe APIs use Basic Auth against `https://api.stripe.com/v1`. Agents never see the raw secret key.

## Agent Tools

- PaymentIntents: list, get, create, update, capture, cancel
- Refunds: list, get, create, cancel
- Checkout Sessions: list, get, create, expire, line items
- Customers: list, get, create, update
- Products and Prices: list, get, create, update
- Webhooks: receive, verify `Stripe-Signature`, dedupe event IDs, and record summaries

Mutating tools run in dry-run mode by default and respect operation allowlists, currency allowlists, amount limits, and optional idempotency keys.
