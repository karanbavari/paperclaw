# Appointment Booking Plugin

First-party PaperClaw plugin for appointment scheduling workflows.

The production connector targets Google Calendar. Operators configure a calendar id, timezone, and a PaperClaw secret reference for a Google bearer token. Agents can list PaperClaw-stored appointments, find availability from Google Calendar free/busy data, create bookings, reschedule bookings, and cancel bookings through plugin tools.

Booking storage:

- Dry run mode only returns the planned request. It does not save a PaperClaw booking and does not call Google Calendar.
- Live mode stores each booking in PaperClaw `plugin_state` under the company scope, then syncs the event to Google Calendar.
- If Google Calendar sync fails after a create/reschedule, the booking remains visible in PaperClaw with `sync_failed` status and the sync error.

This package is private and bundled with the repo for local/self-hosted installs.
