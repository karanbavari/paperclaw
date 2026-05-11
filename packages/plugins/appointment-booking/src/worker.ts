import { randomUUID } from "node:crypto";
import { definePlugin, runWorker, type PluginContext, type ToolResult, type ToolRunContext } from "@kesarcloud/plugin-sdk";
import { DATA_KEYS, PLUGIN_ID, PLUGIN_VERSION, TOOL_NAMES } from "./constants.js";
import {
  GoogleCalendarClient,
  isConfigured,
  normalizeConfig,
  validateConfig,
  type AppointmentBookingConfig,
} from "./google-calendar-client.js";
import {
  getBooking,
  listBookings,
  upsertBooking,
  type AppointmentBookingRecord,
} from "./booking-store.js";

type ListUpcomingParams = {
  limit?: number;
};

type FindAvailabilityParams = {
  serviceId?: string;
  providerId?: string;
  from?: string;
  to?: string;
  durationMinutes?: number;
};

type CreateBookingParams = {
  serviceId?: string;
  providerId?: string;
  start?: string;
  end?: string;
  customer?: Record<string, unknown>;
  notes?: string;
};

type RescheduleBookingParams = {
  appointmentId?: string;
  start?: string;
  end?: string;
};

type CancelBookingParams = {
  appointmentId?: string;
  reason?: string;
};

type BusyRange = {
  start?: string;
  end?: string;
};

function asObject(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? value as Record<string, unknown> : {};
}

function client(ctx: PluginContext, config: AppointmentBookingConfig) {
  return new GoogleCalendarClient(ctx, config);
}

async function getConfig(ctx: PluginContext) {
  return normalizeConfig(await ctx.config.get());
}

function dryRunResult(action: string, request: unknown): ToolResult {
  return {
    content: `Dry run: ${action} request prepared. No PaperClaw booking was saved and no calendar event was sent.`,
    data: { dryRun: true, request },
  };
}

function requireParam(value: unknown, name: string): string | null {
  if (typeof value === "string" && value.trim()) return null;
  return `${name} is required`;
}

function requireLiveConfig(config: AppointmentBookingConfig): string | null {
  if (config.dryRun) return null;
  if (!isConfigured(config)) return "Google Calendar is not configured. Set Google Calendar ID and Google Access Token Secret Reference first.";
  return null;
}

function stringParam(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function numberParam(value: unknown, fallback: number) {
  const parsed = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(5, Math.min(480, Math.floor(parsed)));
}

function addMinutes(iso: string, minutes: number) {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}

function validDate(value: string | null) {
  if (!value) return false;
  return Number.isFinite(new Date(value).getTime());
}

function customerLabel(customer: Record<string, unknown>) {
  const firstName = stringParam(customer.firstName);
  const lastName = stringParam(customer.lastName);
  const email = stringParam(customer.email);
  return [firstName, lastName].filter(Boolean).join(" ") || email || "Customer";
}

function customerEmail(customer: Record<string, unknown>) {
  return stringParam(customer.email);
}

function buildSummary(payload: CreateBookingParams) {
  return `${payload.serviceId ?? "Appointment"} with ${customerLabel(payload.customer ?? {})}`;
}

function bookingToAppointment(booking: AppointmentBookingRecord) {
  return {
    id: booking.id,
    serviceId: booking.serviceId,
    providerId: booking.providerId,
    start: booking.start,
    end: booking.end,
    timezone: booking.timezone,
    customer: booking.customer,
    status: booking.status,
    externalProvider: booking.externalProvider,
    externalCalendarId: booking.externalCalendarId,
    externalEventId: booking.externalEventId,
    externalHtmlLink: booking.externalHtmlLink,
    syncError: booking.syncError,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
  };
}

function overlap(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && bStart < aEnd;
}

function generateSlots(input: {
  from: string;
  to: string;
  durationMinutes: number;
  busy: BusyRange[];
}) {
  const fromMs = new Date(input.from).getTime();
  const toMs = new Date(input.to).getTime();
  const durationMs = input.durationMinutes * 60_000;
  if (!Number.isFinite(fromMs) || !Number.isFinite(toMs) || toMs <= fromMs) return [];

  const busyRanges = input.busy
    .map((range) => ({
      start: range.start ? new Date(range.start).getTime() : Number.NaN,
      end: range.end ? new Date(range.end).getTime() : Number.NaN,
    }))
    .filter((range) => Number.isFinite(range.start) && Number.isFinite(range.end));

  const slots: Array<{ start: string; end: string }> = [];
  for (let cursor = fromMs; cursor + durationMs <= toMs && slots.length < 50; cursor += durationMs) {
    const slotEnd = cursor + durationMs;
    if (busyRanges.some((busy) => overlap(cursor, slotEnd, busy.start, busy.end))) continue;
    slots.push({ start: new Date(cursor).toISOString(), end: new Date(slotEnd).toISOString() });
  }
  return slots;
}

async function registerDataHandlers(ctx: PluginContext) {
  ctx.data.register(DATA_KEYS.status, async () => {
    const { config, errors, warnings } = validateConfig(await ctx.config.get());
    return {
      pluginId: PLUGIN_ID,
      version: PLUGIN_VERSION,
      provider: config.provider,
      configured: isConfigured(config),
      dryRun: config.dryRun,
      calendarId: config.googleCalendarId || null,
      timezone: config.timezone,
      defaultDurationMinutes: config.defaultDurationMinutes,
      storage: "PaperClaw plugin_state",
      errors,
      warnings,
    };
  });

  ctx.data.register(DATA_KEYS.upcoming, async (params) => {
    const companyId = stringParam(params.companyId);
    if (!companyId) {
      return { configured: false, appointments: [], storage: "PaperClaw plugin_state" };
    }
    const limit = Math.max(1, Math.min(50, Number(params.limit ?? 10) || 10));
    const appointments = (await listBookings(ctx, companyId, limit))
      .filter((booking) => booking.status !== "cancelled")
      .map(bookingToAppointment);
    return {
      configured: true,
      storage: "PaperClaw plugin_state",
      appointments,
    };
  });

  ctx.data.register(DATA_KEYS.bookings, async (params) => {
    const companyId = stringParam(params.companyId);
    if (!companyId) return { bookings: [], storage: "PaperClaw plugin_state" };
    const limit = Math.max(1, Math.min(100, Number(params.limit ?? 25) || 25));
    return {
      storage: "PaperClaw plugin_state",
      bookings: (await listBookings(ctx, companyId, limit)).map(bookingToAppointment),
    };
  });
}

async function registerToolHandlers(ctx: PluginContext) {
  ctx.tools.register(
    TOOL_NAMES.listUpcoming,
    {
      displayName: "List Upcoming Appointments",
      description: "List upcoming appointments stored by PaperClaw.",
      parametersSchema: {
        type: "object",
        properties: {
          limit: { type: "number", minimum: 1, maximum: 50 },
        },
      },
    },
    async (params, runCtx): Promise<ToolResult> => {
      const payload = asObject(params) as ListUpcomingParams;
      const limit = Math.max(1, Math.min(50, Number(payload.limit ?? 10) || 10));
      const appointments = (await listBookings(ctx, runCtx.companyId, limit))
        .filter((booking) => booking.status !== "cancelled")
        .map(bookingToAppointment);
      return {
        content: appointments.length > 0 ? "Upcoming PaperClaw bookings loaded." : "No PaperClaw bookings have been saved yet.",
        data: { storage: "PaperClaw plugin_state", appointments },
      };
    },
  );

  ctx.tools.register(
    TOOL_NAMES.findAvailability,
    {
      displayName: "Find Appointment Availability",
      description: "Find available Google Calendar slots for a service/provider/date range.",
      parametersSchema: {
        type: "object",
        properties: {
          serviceId: { type: "string" },
          providerId: { type: "string" },
          from: { type: "string" },
          to: { type: "string" },
          durationMinutes: { type: "number", minimum: 5, maximum: 480 },
        },
        required: ["serviceId", "from", "to"],
      },
    },
    async (params): Promise<ToolResult> => {
      const config = await getConfig(ctx);
      const payload = asObject(params) as FindAvailabilityParams;
      const errors = [
        requireParam(payload.serviceId, "serviceId"),
        requireParam(payload.from, "from"),
        requireParam(payload.to, "to"),
      ].filter(Boolean);
      if (errors.length > 0) return { error: errors.join(", ") };
      if (!validDate(payload.from ?? null) || !validDate(payload.to ?? null)) {
        return { error: "from and to must be valid ISO date/time values" };
      }

      const request = {
        provider: config.provider,
        calendarId: config.googleCalendarId || null,
        serviceId: payload.serviceId,
        providerId: payload.providerId,
        from: payload.from,
        to: payload.to,
        durationMinutes: numberParam(payload.durationMinutes, config.defaultDurationMinutes),
        timezone: config.timezone,
      };
      if (config.dryRun) return dryRunResult("availability lookup", request);
      const configError = requireLiveConfig(config);
      if (configError) return { error: configError };

      const busy = await client(ctx, config).findBusy({ from: payload.from!, to: payload.to! });
      const slots = generateSlots({
        from: payload.from!,
        to: payload.to!,
        durationMinutes: request.durationMinutes,
        busy,
      });
      return { content: "Availability loaded from Google Calendar.", data: { ...request, busy, slots } };
    },
  );

  ctx.tools.register(
    TOOL_NAMES.createBooking,
    {
      displayName: "Create Booking",
      description: "Create a PaperClaw booking and sync it to Google Calendar.",
      parametersSchema: {
        type: "object",
        properties: {
          serviceId: { type: "string" },
          providerId: { type: "string" },
          start: { type: "string" },
          end: { type: "string" },
          customer: { type: "object" },
          notes: { type: "string" },
        },
        required: ["serviceId", "start", "customer"],
      },
    },
    async (params, runCtx): Promise<ToolResult> => {
      const config = await getConfig(ctx);
      const payload = asObject(params) as CreateBookingParams;
      if (!payload.serviceId || !payload.start || !payload.customer) {
        return { error: "serviceId, start, and customer are required" };
      }
      if (!validDate(payload.start)) return { error: "start must be a valid ISO date/time value" };

      const end = payload.end && validDate(payload.end)
        ? payload.end
        : addMinutes(payload.start, config.defaultDurationMinutes);
      const request = buildBookingRequest(config, payload, end);
      if (config.dryRun) return dryRunResult("create booking", request);
      const configError = requireLiveConfig(config);
      if (configError) return { error: configError };

      const now = new Date().toISOString();
      const booking: AppointmentBookingRecord = {
        id: randomUUID(),
        companyId: runCtx.companyId,
        projectId: runCtx.projectId,
        agentId: runCtx.agentId,
        runId: runCtx.runId,
        serviceId: payload.serviceId,
        providerId: payload.providerId,
        start: payload.start,
        end,
        timezone: config.timezone,
        customer: payload.customer,
        notes: payload.notes,
        status: "sync_failed",
        syncError: "Google Calendar sync pending.",
        externalProvider: "google_calendar",
        externalCalendarId: config.googleCalendarId,
        createdAt: now,
        updatedAt: now,
      };

      try {
        const event = await client(ctx, config).createEvent({
          summary: buildSummary(payload),
          description: payload.notes,
          start: payload.start,
          end,
          timezone: config.timezone,
          attendees: customerEmail(payload.customer) ? [{ email: customerEmail(payload.customer)! }] : undefined,
        });
        const synced: AppointmentBookingRecord = {
          ...booking,
          status: "confirmed",
          syncError: undefined,
          externalEventId: event.id,
          externalHtmlLink: event.htmlLink,
          updatedAt: new Date().toISOString(),
        };
        await upsertBooking(ctx, synced);
        return {
          content: `Booking created and synced to Google Calendar. Booking id: ${synced.id}.`,
          data: { storage: "PaperClaw plugin_state", booking: bookingToAppointment(synced), googleEvent: event },
        };
      } catch (err) {
        const failed = {
          ...booking,
          syncError: err instanceof Error ? err.message : String(err),
          updatedAt: new Date().toISOString(),
        };
        await upsertBooking(ctx, failed);
        return {
          error: `Booking saved in PaperClaw but Google Calendar sync failed: ${failed.syncError}`,
          data: { storage: "PaperClaw plugin_state", booking: bookingToAppointment(failed) },
        };
      }
    },
  );

  ctx.tools.register(
    TOOL_NAMES.rescheduleBooking,
    {
      displayName: "Reschedule Booking",
      description: "Move an existing booking and sync the Google Calendar event.",
      parametersSchema: {
        type: "object",
        properties: {
          appointmentId: { type: "string" },
          start: { type: "string" },
          end: { type: "string" },
        },
        required: ["appointmentId", "start"],
      },
    },
    async (params, runCtx): Promise<ToolResult> => {
      const config = await getConfig(ctx);
      const payload = asObject(params) as RescheduleBookingParams;
      if (!payload.appointmentId || !payload.start) return { error: "appointmentId and start are required" };
      if (!validDate(payload.start)) return { error: "start must be a valid ISO date/time value" };
      const end = payload.end && validDate(payload.end)
        ? payload.end
        : addMinutes(payload.start, config.defaultDurationMinutes);
      const request = { appointmentId: payload.appointmentId, start: payload.start, end, timezone: config.timezone };
      if (config.dryRun) return dryRunResult("reschedule booking", request);
      const configError = requireLiveConfig(config);
      if (configError) return { error: configError };

      const booking = await getBooking(ctx, runCtx.companyId, payload.appointmentId);
      if (!booking) return { error: `Booking ${payload.appointmentId} was not found in PaperClaw storage.` };
      if (!booking.externalEventId) return { error: `Booking ${payload.appointmentId} has no Google Calendar event id.` };

      try {
        const event = await client(ctx, config).rescheduleEvent(booking.externalEventId, {
          start: payload.start,
          end,
          timezone: config.timezone,
        });
        const updated: AppointmentBookingRecord = {
          ...booking,
          start: payload.start,
          end,
          status: "confirmed",
          syncError: undefined,
          updatedAt: new Date().toISOString(),
          externalHtmlLink: event.htmlLink ?? booking.externalHtmlLink,
        };
        await upsertBooking(ctx, updated);
        return { content: "Booking rescheduled and synced to Google Calendar.", data: { booking: bookingToAppointment(updated), googleEvent: event } };
      } catch (err) {
        const updated: AppointmentBookingRecord = {
          ...booking,
          start: payload.start,
          end,
          status: "sync_failed",
          syncError: err instanceof Error ? err.message : String(err),
          updatedAt: new Date().toISOString(),
        };
        await upsertBooking(ctx, updated);
        return { error: `Booking updated in PaperClaw but Google Calendar sync failed: ${updated.syncError}`, data: { booking: bookingToAppointment(updated) } };
      }
    },
  );

  ctx.tools.register(
    TOOL_NAMES.cancelBooking,
    {
      displayName: "Cancel Booking",
      description: "Cancel a PaperClaw booking and remove the Google Calendar event.",
      parametersSchema: {
        type: "object",
        properties: {
          appointmentId: { type: "string" },
          reason: { type: "string" },
        },
        required: ["appointmentId"],
      },
    },
    async (params, runCtx): Promise<ToolResult> => {
      const config = await getConfig(ctx);
      const payload = asObject(params) as CancelBookingParams;
      if (!payload.appointmentId) return { error: "appointmentId is required" };
      const request = { appointmentId: payload.appointmentId, reason: payload.reason };
      if (config.dryRun) return dryRunResult("cancel booking", request);
      const configError = requireLiveConfig(config);
      if (configError) return { error: configError };

      const booking = await getBooking(ctx, runCtx.companyId, payload.appointmentId);
      if (!booking) return { error: `Booking ${payload.appointmentId} was not found in PaperClaw storage.` };

      try {
        if (booking.externalEventId) await client(ctx, config).cancelEvent(booking.externalEventId);
        const cancelled: AppointmentBookingRecord = {
          ...booking,
          status: "cancelled",
          syncError: undefined,
          updatedAt: new Date().toISOString(),
          cancelledAt: new Date().toISOString(),
        };
        await upsertBooking(ctx, cancelled);
        return { content: "Booking cancelled and Google Calendar was updated.", data: { booking: bookingToAppointment(cancelled) } };
      } catch (err) {
        const failed: AppointmentBookingRecord = {
          ...booking,
          status: "sync_failed",
          syncError: err instanceof Error ? err.message : String(err),
          updatedAt: new Date().toISOString(),
        };
        await upsertBooking(ctx, failed);
        return { error: `Google Calendar cancellation failed: ${failed.syncError}`, data: { booking: bookingToAppointment(failed) } };
      }
    },
  );
}

function buildBookingRequest(config: AppointmentBookingConfig, payload: CreateBookingParams, end: string) {
  return {
    provider: config.provider,
    calendarId: config.googleCalendarId || null,
    body: {
      serviceId: payload.serviceId,
      providerId: payload.providerId,
      start: payload.start,
      end,
      customer: payload.customer,
      notes: payload.notes,
      timezone: config.timezone,
    },
  };
}

const plugin = definePlugin({
  async setup(ctx) {
    await registerDataHandlers(ctx);
    await registerToolHandlers(ctx);
    ctx.logger.info("Appointment Booking plugin setup complete");
  },

  async onValidateConfig(config) {
    const result = validateConfig(config);
    return {
      ok: result.errors.length === 0,
      errors: result.errors,
      warnings: result.warnings,
    };
  },

  async onHealth() {
    return {
      status: "ok",
      message: "Appointment Booking plugin worker is running.",
    };
  },
});

export default plugin;
runWorker(plugin, import.meta.url);
