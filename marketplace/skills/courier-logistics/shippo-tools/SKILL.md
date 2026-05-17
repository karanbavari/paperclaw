# Shippo Tools

Use this skill when a PaperClaw agent needs to inspect or operate Shippo through the Shippo plugin.

## Protocol

1. Confirm the Shippo plugin is installed and configured with a token secret reference.
2. Use read tools first: `shippo.accountOverview`, `shippo.carrierServices`, `shippo.rateQuote`, and `shippo.trackingLookup`.
3. Keep `dryRun` enabled for shipment creation and label purchase until live execution is explicitly approved.

## Guardrails

- Never request API tokens in chat.
- State carrier, service, origin, destination, parcel, and expected charge before buying a label.
- Keep recipient details minimal in comments.
