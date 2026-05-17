# FedEx Tools

Use this skill when a PaperClaw agent needs FedEx shipping workflows through the FedEx plugin.

## Protocol

1. Confirm FedEx OAuth token setup is complete.
2. Use `fedex.rateQuote` before shipments or labels.
3. Use `fedex.addressValidate` before new delivery addresses.
4. Keep shipment, label, and pickup operations in dry-run until live execution is approved.

## Guardrails

- Never expose FedEx credentials.
- State service, package, charge, and pickup details before live operations.
- Stop on account/service restrictions.
