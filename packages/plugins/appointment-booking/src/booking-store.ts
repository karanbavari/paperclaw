import type { PluginContext } from "@kesarcloud/plugin-sdk";

const BOOKING_NAMESPACE = "bookings";
const BOOKING_INDEX_KEY = "index";

export type BookingStatus = "confirmed" | "sync_failed" | "cancelled";

export interface AppointmentBookingRecord {
  id: string;
  companyId: string;
  projectId: string;
  agentId: string;
  runId: string;
  serviceId: string;
  providerId?: string;
  start: string;
  end: string;
  timezone: string;
  customer: Record<string, unknown>;
  notes?: string;
  status: BookingStatus;
  externalProvider: "google_calendar";
  externalCalendarId: string;
  externalEventId?: string;
  externalHtmlLink?: string;
  syncError?: string;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
}

export function bookingStateKey(bookingId: string) {
  return `booking:${bookingId}`;
}

export async function listBookings(ctx: PluginContext, companyId: string, limit = 20) {
  const index = await getBookingIndex(ctx, companyId);
  const bookings: AppointmentBookingRecord[] = [];
  for (const bookingId of index) {
    const record = await getBooking(ctx, companyId, bookingId);
    if (record) bookings.push(record);
    if (bookings.length >= limit) break;
  }
  return bookings;
}

export async function getBooking(ctx: PluginContext, companyId: string, bookingId: string) {
  const raw = await ctx.state.get({
    scopeKind: "company",
    scopeId: companyId,
    namespace: BOOKING_NAMESPACE,
    stateKey: bookingStateKey(bookingId),
  });
  return isBookingRecord(raw) ? raw : null;
}

export async function upsertBooking(ctx: PluginContext, booking: AppointmentBookingRecord) {
  await ctx.state.set({
    scopeKind: "company",
    scopeId: booking.companyId,
    namespace: BOOKING_NAMESPACE,
    stateKey: bookingStateKey(booking.id),
  }, booking);

  const index = await getBookingIndex(ctx, booking.companyId);
  if (!index.includes(booking.id)) {
    await ctx.state.set({
      scopeKind: "company",
      scopeId: booking.companyId,
      namespace: BOOKING_NAMESPACE,
      stateKey: BOOKING_INDEX_KEY,
    }, [booking.id, ...index].slice(0, 500));
  }
}

async function getBookingIndex(ctx: PluginContext, companyId: string) {
  const raw = await ctx.state.get({
    scopeKind: "company",
    scopeId: companyId,
    namespace: BOOKING_NAMESPACE,
    stateKey: BOOKING_INDEX_KEY,
  });
  return Array.isArray(raw) ? raw.filter((item): item is string => typeof item === "string") : [];
}

function isBookingRecord(value: unknown): value is AppointmentBookingRecord {
  return typeof value === "object"
    && value !== null
    && typeof (value as AppointmentBookingRecord).id === "string"
    && typeof (value as AppointmentBookingRecord).companyId === "string";
}
