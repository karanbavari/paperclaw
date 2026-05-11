import { afterEach, describe, expect, it, vi } from "vitest";
import { createTestHarness } from "@kesarcloud/plugin-sdk/testing";
import manifest from "./manifest.js";
import plugin from "./worker.js";
import { bookingStateKey } from "./booking-store.js";
import { TOOL_NAMES } from "./constants.js";

const runCtx = {
  companyId: "company-1",
  projectId: "project-1",
  agentId: "agent-1",
  runId: "run-1",
};

describe("appointment booking plugin", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not persist dry-run bookings", async () => {
    const harness = createTestHarness({ manifest });
    await plugin.definition.setup(harness.ctx);

    const result = await harness.executeTool(TOOL_NAMES.createBooking, {
      serviceId: "strategy-call",
      start: "2026-05-12T10:00:00+05:30",
      customer: { email: "demo.customer@example.com" },
    }, runCtx);

    expect(result.content).toContain("Dry run");
    expect(result.content).toContain("No PaperClaw booking was saved");
    expect(harness.getState({
      scopeKind: "company",
      scopeId: runCtx.companyId,
      namespace: "bookings",
      stateKey: "index",
    })).toBeUndefined();
  });

  it("stores live bookings and syncs them to Google Calendar", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      id: "google-event-1",
      htmlLink: "https://calendar.google.com/event?eid=google-event-1",
    }), { status: 200, headers: { "content-type": "application/json" } }));

    const harness = createTestHarness({
      manifest,
      config: {
        dryRun: false,
        googleCalendarId: "team@example.com",
        googleAccessTokenSecretRef: "secret-google-token",
        timezone: "Asia/Kolkata",
      },
    });
    await plugin.definition.setup(harness.ctx);

    const result = await harness.executeTool(TOOL_NAMES.createBooking, {
      serviceId: "strategy-call",
      start: "2026-05-12T10:00:00+05:30",
      customer: { firstName: "Demo", email: "demo.customer@example.com" },
    }, runCtx);

    expect(result.content).toContain("Booking created and synced");
    const booking = (result.data as { booking: { id: string; externalEventId: string; status: string } }).booking;
    expect(booking.externalEventId).toBe("google-event-1");
    expect(booking.status).toBe("confirmed");
    expect(harness.getState({
      scopeKind: "company",
      scopeId: runCtx.companyId,
      namespace: "bookings",
      stateKey: bookingStateKey(booking.id),
    })).toMatchObject({
      id: booking.id,
      status: "confirmed",
      externalEventId: "google-event-1",
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("https://www.googleapis.com/calendar/v3/calendars/team%40example.com/events"),
      expect.objectContaining({ method: "POST" }),
    );
  });
});
