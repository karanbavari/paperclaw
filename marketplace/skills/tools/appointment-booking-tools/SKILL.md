---
name: appointment-booking-tools
description: >
  Use when a PaperClaw agent needs the Appointment Booking plugin to list
  appointments, find Google Calendar-backed availability, create bookings,
  reschedule, cancel, handle dry-run/live mode, and report sync failures safely.
---

# Appointment Booking Tools

Use this skill with the Appointment Booking plugin. The plugin stores bookings in PaperClaw plugin state and syncs live bookings to Google Calendar.

## Preflight

1. Confirm the plugin is installed and configured with calendar ID, timezone, duration, and Google access token secret reference.
2. Check whether dry-run mode is enabled.
3. Confirm service, provider, customer, timezone, and desired time window before creating or changing a booking.

## Booking Workflow

1. Use `appointments.listUpcoming` to avoid duplicates when relevant.
2. Use `appointments.findAvailability` with service ID, provider ID when known, time window, and duration.
3. Present available slots clearly with timezone.
4. Confirm the selected slot and required customer fields.
5. Use `appointments.createBooking`.
6. Verify the returned booking status and Google Calendar sync result.

## Reschedule Workflow

1. Identify the existing appointment ID.
2. Find availability for the new window.
3. Confirm the new time and reason.
4. Use `appointments.rescheduleBooking`.
5. Verify the updated booking and sync status.

## Cancel Workflow

1. Confirm the appointment ID and cancellation reason.
2. Use `appointments.cancelBooking`.
3. Verify the booking is cancelled and the calendar event was removed or marked with the sync result.

## Safety Rules

- Do not create, reschedule, or cancel bookings without clear user/operator authority.
- Treat dry-run output as a preview, not a completed booking.
- If Google Calendar sync fails after a live operation, report the PaperClaw booking status and the sync error.
- Do not expose bearer tokens or secret references beyond naming the configured secret reference when needed.
- Preserve customer privacy in comments and summaries.
