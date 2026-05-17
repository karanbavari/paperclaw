# Stripe Tools

Use this skill when a PaperClaw agent needs to inspect or operate Stripe Merchant Core workflows through the Stripe plugin.

## Before Using Tools

1. Confirm the Stripe plugin is installed and configured.
2. Confirm whether the issue is for test mode or live mode.
3. Prefer dry-run for any PaymentIntent, refund, Checkout Session, customer, product, or price mutation unless the issue explicitly asks for live execution.
4. Use read tools first to identify exact Stripe object IDs.

## Tool Protocol

- Use `stripe.paymentIntentGet` before capture, cancel, or update actions.
- Use `stripe.refundsList` or `stripe.refundGet` before follow-up refund work.
- Use `stripe.checkoutSessionCreate` for hosted checkout flows and inspect line items with `stripe.checkoutSessionLineItems`.
- Use product and price tools for catalog setup only when the issue explicitly asks for catalog changes.
- Use customer tools for operational customer records. Do not expose full customer contact details unless needed for the issue.

## Guardrails

- Never ask the user for a Stripe secret key in chat. The plugin resolves it from PaperClaw secrets.
- Respect operation allowlists, currency allowlists, configured amount limits, and idempotency keys.
- For live captures/refunds/Checkout Sessions, state exactly what will change before running the tool.
- Keep outputs concise. Summarize payment/session/customer status instead of dumping full payloads.
- If Stripe returns an error object, include the type/code/message and stop until the request is corrected.

## Handoff Notes

When a Stripe task is complete, comment with:

- mode label: test or live
- tools used
- whether the run was dry-run or live
- IDs touched, such as PaymentIntent, refund, Checkout Session, customer, product, or price ID
- concrete result or Stripe error
- next action, if any
