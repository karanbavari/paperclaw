# Razorpay Tools

Use this skill when a PaperClaw agent needs to inspect or operate Razorpay merchant payment workflows through the Razorpay plugin.

## Before Using Tools

1. Confirm the Razorpay plugin is installed and configured.
2. Confirm whether the issue is for test mode or live mode.
3. Prefer dry-run for any order, capture, refund, payment link, or customer mutation unless the issue explicitly asks for live execution.
4. Use read tools first to identify the exact payment, order, refund, payment link, or customer ID.

## Tool Protocol

- Use `razorpay.ordersList`, `razorpay.orderGet`, and `razorpay.orderPayments` before order-related actions.
- Use `razorpay.paymentGet` before `razorpay.paymentCapture`.
- Use `razorpay.paymentRefundsList` before creating another refund for the same payment.
- Use `razorpay.refundCreate` only with a clear payment ID and amount intent. If amount is omitted, treat it as a full-refund request and state that explicitly.
- Use `razorpay.paymentLinkCreate` for payment requests that do not need checkout integration.
- Use customer tools only for operational customer records. Do not expose full customer contact details unless needed for the issue.

## Guardrails

- Never ask the user for a Razorpay Key Secret in chat. The plugin resolves it from PaperClaw secrets.
- Respect operation allowlists, currency allowlists, and configured amount limits.
- For live captures/refunds/payment links, state exactly what will change before running the tool.
- Keep outputs concise. Summarize payment/order status instead of dumping full payloads.
- If Razorpay returns an error object, include the code/description and stop until the request is corrected.

## Handoff Notes

When a Razorpay task is complete, comment with:

- mode label: test or live
- tools used
- whether the run was dry-run or live
- IDs touched, such as order ID, payment ID, refund ID, or payment link ID
- concrete result or Razorpay error
- next action, if any
