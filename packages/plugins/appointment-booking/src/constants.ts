export const PLUGIN_ID = "paperclaw.appointment-booking";
export const PLUGIN_VERSION = "0.1.0";
export const PAGE_ROUTE = "appointment-booking";

export const EXPORT_NAMES = {
  page: "AppointmentBookingPage",
  settingsPage: "AppointmentBookingSettingsPage",
  dashboardWidget: "AppointmentBookingDashboardWidget",
} as const;

export const SLOT_IDS = {
  page: "appointment-booking-page",
  settingsPage: "appointment-booking-settings-page",
  dashboardWidget: "appointment-booking-dashboard-widget",
} as const;

export const TOOL_NAMES = {
  listUpcoming: "appointments.listUpcoming",
  findAvailability: "appointments.findAvailability",
  createBooking: "appointments.createBooking",
  rescheduleBooking: "appointments.rescheduleBooking",
  cancelBooking: "appointments.cancelBooking",
} as const;

export const DATA_KEYS = {
  status: "status",
  upcoming: "upcoming",
  bookings: "bookings",
} as const;

export const DEFAULT_CONFIG = {
  provider: "google_calendar",
  googleCalendarId: "",
  googleAccessTokenSecretRef: "",
  timezone: "UTC",
  defaultDurationMinutes: 30,
  dryRun: true,
} as const;
