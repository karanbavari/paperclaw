# @kesarcloud/plugin-razorpay

First-party PaperClaw plugin that gives agents a governed Razorpay merchant payment tool surface.

## Setup

1. Generate Razorpay API keys in test or live mode.
2. Store the Key Secret in PaperClaw secrets.
3. Configure the plugin with:
   - Razorpay Key ID
   - Key Secret reference
   - Webhook Secret reference
   - mode label, usually `test` or `live`
4. Configure Razorpay webhooks to point at:

   ```text
   https://YOUR-PAPERCLAW-HOST/api/plugins/paperclaw.razorpay/webhooks/razorpay
   ```

Razorpay APIs use Basic Auth against `https://api.razorpay.com/v1`. Agents never see the raw Key Secret.

## Agent Tools

- Payments: list, get, capture, update notes
- Orders: list, create, get, update notes, list order payments
- Refunds: list, get, create, update notes, list payment refunds
- Payment links: list, create, get, update, cancel, notify
- Customers: list, create, get, update
- Webhooks: receive, verify signature, dedupe event IDs, and record summaries

Mutating tools run in dry-run mode by default and respect operation allowlists, currency allowlists, and amount limits.
