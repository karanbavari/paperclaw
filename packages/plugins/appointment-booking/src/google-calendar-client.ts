import type { PluginContext } from "@kesarcloud/plugin-sdk";
import { DEFAULT_CONFIG } from "./constants.js";

export interface AppointmentBookingConfig {
  provider: "google_calendar";
  googleCalendarId: string;
  googleAccessTokenSecretRef: string;
  timezone: string;
  defaultDurationMinutes: number;
  dryRun: boolean;
}

export interface GoogleCalendarEventInput {
  summary: string;
  description?: string;
  start: string;
  end: string;
  timezone: string;
  attendees?: Array<{ email: string; displayName?: string }>;
}

export interface GoogleCalendarEventResult {
  id?: string;
  htmlLink?: string;
  status?: string;
  summary?: string;
  start?: unknown;
  end?: unknown;
}

type GoogleBusyRange = {
  start?: string;
  end?: string;
};

type GoogleFreeBusyResponse = {
  calendars?: Record<string, { busy?: GoogleBusyRange[]; errors?: unknown[] }>;
};

export function normalizeConfig(raw: Record<string, unknown>): AppointmentBookingConfig {
  const legacyTokenRef = typeof raw.apiTokenSecretRef === "string" ? raw.apiTokenSecretRef.trim() : "";
  return {
    provider: "google_calendar",
    googleCalendarId: typeof raw.googleCalendarId === "string" ? raw.googleCalendarId.trim() : "",
    googleAccessTokenSecretRef: typeof raw.googleAccessTokenSecretRef === "string"
      ? raw.googleAccessTokenSecretRef.trim()
      : legacyTokenRef,
    timezone: typeof raw.timezone === "string" && raw.timezone.trim() ? raw.timezone.trim() : DEFAULT_CONFIG.timezone,
    defaultDurationMinutes: normalizeDuration(raw.defaultDurationMinutes),
    dryRun: typeof raw.dryRun === "boolean" ? raw.dryRun : DEFAULT_CONFIG.dryRun,
  };
}

export function validateConfig(raw: Record<string, unknown>) {
  const config = normalizeConfig(raw);
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!config.dryRun && !config.googleCalendarId) {
    errors.push("Google Calendar ID is required when Dry Run is disabled.");
  }
  if (!config.dryRun && !config.googleAccessTokenSecretRef) {
    errors.push("Google Access Token Secret Reference is required when Dry Run is disabled.");
  }
  if (config.dryRun) {
    warnings.push("Dry Run is enabled. Mutating tools will not save bookings or create calendar events.");
  }
  if (!isConfigured(config)) {
    warnings.push("Google Calendar is not connected yet. Live booking requires calendar ID and access token secret reference.");
  }

  return { config, errors, warnings };
}

export function isConfigured(config: AppointmentBookingConfig) {
  return Boolean(config.googleCalendarId && config.googleAccessTokenSecretRef);
}

function normalizeDuration(value: unknown) {
  const parsed = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed)) return DEFAULT_CONFIG.defaultDurationMinutes;
  return Math.max(5, Math.min(480, Math.floor(parsed)));
}

function encodeCalendarId(calendarId: string) {
  return encodeURIComponent(calendarId);
}

function googleApiUrl(path: string, query?: Record<string, string | number | boolean | null | undefined>) {
  const url = new URL(`https://www.googleapis.com/calendar/v3${path}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === null || value === undefined || value === "") continue;
    url.searchParams.set(key, String(value));
  }
  return url.toString();
}

function toErrorDetail(payload: unknown, fallback: string) {
  if (typeof payload === "object" && payload !== null && "error" in payload) {
    const error = (payload as { error?: { message?: unknown } }).error;
    if (typeof error?.message === "string") return error.message;
  }
  if (typeof payload === "object" && payload !== null && "message" in payload) {
    const message = (payload as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return fallback;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export class GoogleCalendarClient {
  constructor(
    private readonly ctx: PluginContext,
    private readonly config: AppointmentBookingConfig,
  ) {}

  async listEvents(input: { timeMin: string; maxResults: number }) {
    return this.request<unknown[]>({
      path: `/calendars/${encodeCalendarId(this.config.googleCalendarId)}/events`,
      query: {
        timeMin: input.timeMin,
        maxResults: input.maxResults,
        singleEvents: true,
        orderBy: "startTime",
      },
    });
  }

  async findBusy(input: { from: string; to: string }) {
    const result = await this.request<GoogleFreeBusyResponse>({
      path: "/freeBusy",
      method: "POST",
      body: {
        timeMin: input.from,
        timeMax: input.to,
        timeZone: this.config.timezone,
        items: [{ id: this.config.googleCalendarId }],
      },
    });
    return result.calendars?.[this.config.googleCalendarId]?.busy ?? [];
  }

  async createEvent(input: GoogleCalendarEventInput) {
    return this.request<GoogleCalendarEventResult>({
      path: `/calendars/${encodeCalendarId(this.config.googleCalendarId)}/events`,
      method: "POST",
      query: { sendUpdates: "all" },
      body: eventBody(input),
    });
  }

  async rescheduleEvent(eventId: string, input: Pick<GoogleCalendarEventInput, "start" | "end" | "timezone">) {
    return this.request<GoogleCalendarEventResult>({
      path: `/calendars/${encodeCalendarId(this.config.googleCalendarId)}/events/${encodeURIComponent(eventId)}`,
      method: "PATCH",
      query: { sendUpdates: "all" },
      body: {
        start: { dateTime: input.start, timeZone: input.timezone },
        end: { dateTime: input.end, timeZone: input.timezone },
      },
    });
  }

  async cancelEvent(eventId: string) {
    return this.request<null>({
      path: `/calendars/${encodeCalendarId(this.config.googleCalendarId)}/events/${encodeURIComponent(eventId)}`,
      method: "DELETE",
      query: { sendUpdates: "all" },
    });
  }

  private async request<T>(request: {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    path: string;
    query?: Record<string, string | number | boolean | null | undefined>;
    body?: unknown;
  }): Promise<T> {
    if (!isConfigured(this.config)) {
      throw new Error("Google Calendar is not configured.");
    }

    const token = await this.ctx.secrets.resolve(this.config.googleAccessTokenSecretRef);
    const response = await this.ctx.http.fetch(googleApiUrl(request.path, request.query), {
      method: request.method ?? "GET",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${token}`,
        ...(request.body === undefined ? {} : { "content-type": "application/json" }),
      },
      body: request.body === undefined ? undefined : JSON.stringify(request.body),
    });

    const text = await response.text();
    const payload = text ? safeJson(text) : null;
    if (!response.ok) {
      throw new Error(`Google Calendar request failed (${response.status}): ${toErrorDetail(payload, response.statusText)}`);
    }
    return payload as T;
  }
}

function eventBody(input: GoogleCalendarEventInput) {
  return {
    summary: input.summary,
    description: input.description,
    start: { dateTime: input.start, timeZone: input.timezone },
    end: { dateTime: input.end, timeZone: input.timezone },
    attendees: input.attendees,
  };
}
