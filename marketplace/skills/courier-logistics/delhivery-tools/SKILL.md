# Delhivery Tools

Use this skill when a PaperClaw agent needs Indian ecommerce logistics workflows through the Delhivery plugin.

## Protocol

1. Confirm Delhivery token setup is complete.
2. Use serviceability and rate tools before shipment creation.
3. Use `delhivery.trackingLookup` for waybill status.
4. Keep waybill, pickup, and label actions in dry-run until live execution is approved.

## Guardrails

- Never expose Delhivery tokens.
- Verify pickup pincode, delivery pincode, weight, COD/prepaid mode, and invoice data.
- Report serviceability failures clearly.
