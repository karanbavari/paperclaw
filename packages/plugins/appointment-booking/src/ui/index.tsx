import {
  useHostContext,
  usePluginData,
  type PluginPageProps,
  type PluginSettingsPageProps,
  type PluginWidgetProps,
} from "@kesarcloud/plugin-sdk/ui";
import { DATA_KEYS } from "../constants.js";

type StatusData = {
  provider: string;
  configured: boolean;
  dryRun: boolean;
  calendarId: string | null;
  timezone: string;
  defaultDurationMinutes: number;
  storage: string;
  errors: string[];
  warnings: string[];
};

type UpcomingData = {
  configured: boolean;
  appointments: Array<Record<string, unknown>>;
};

const panelStyle = {
  border: "1px solid var(--border, #d7d7d7)",
  background: "var(--card, #fff)",
  padding: 16,
} as const;

const mutedStyle = {
  color: "var(--muted-foreground, #666)",
  fontSize: 13,
} as const;

function formatAppointment(appointment: Record<string, unknown>) {
  const start = appointment.start ?? appointment.startDateTime ?? appointment.start_datetime ?? appointment.startDate;
  const service = appointment.serviceId ?? appointment.serviceName ?? appointment.service ?? appointment.id ?? "Appointment";
  const status = appointment.status ? ` (${appointment.status})` : "";
  return {
    title: `${String(service)}${status}`,
    subtitle: start ? String(start) : "No start time",
  };
}

function StatusPanel({ compact = false }: { compact?: boolean }) {
  const status = usePluginData<StatusData>(DATA_KEYS.status);
  const data = status.data;

  if (status.loading) return <div style={mutedStyle}>Loading appointment connector...</div>;
  if (status.error) return <div style={{ color: "var(--destructive, #b00020)", fontSize: 13 }}>{status.error.message}</div>;

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <strong>{data?.configured ? "Connected" : "Setup needed"}</strong>
        <span style={{ ...mutedStyle, border: "1px solid var(--border, #d7d7d7)", padding: "2px 6px" }}>
          {data?.dryRun ? "Dry run" : "Live"}
        </span>
      </div>
      {!compact ? (
        <>
          <div style={mutedStyle}>Provider: Google Calendar</div>
          <div style={mutedStyle}>Calendar: {data?.calendarId ?? "Not configured"}</div>
          <div style={mutedStyle}>Timezone: {data?.timezone ?? "UTC"}</div>
          <div style={mutedStyle}>Storage: {data?.storage ?? "PaperClaw plugin_state"}</div>
        </>
      ) : null}
      {(data?.errors.length ?? 0) > 0 ? (
        <div style={{ color: "var(--destructive, #b00020)", fontSize: 13 }}>{data!.errors.join(" ")}</div>
      ) : null}
      {(data?.warnings.length ?? 0) > 0 ? (
        <div style={mutedStyle}>{data!.warnings.join(" ")}</div>
      ) : null}
    </div>
  );
}

function UpcomingList({ limit }: { limit: number }) {
  const host = useHostContext();
  const upcoming = usePluginData<UpcomingData>(DATA_KEYS.upcoming, { companyId: host.companyId, limit });
  if (upcoming.loading) return <div style={mutedStyle}>Loading upcoming appointments...</div>;
  if (upcoming.error) return <div style={mutedStyle}>Upcoming appointments are unavailable.</div>;
  if (!upcoming.data?.configured) return <div style={mutedStyle}>Open this plugin inside a company to show appointments.</div>;
  if (upcoming.data.appointments.length === 0) return <div style={mutedStyle}>No PaperClaw bookings have been saved yet.</div>;

  return (
    <div style={{ display: "grid", gap: 8 }}>
      {upcoming.data.appointments.map((appointment, index) => {
        const item = formatAppointment(appointment);
        return (
          <div key={`${item.title}-${index}`} style={{ borderTop: "1px solid var(--border, #d7d7d7)", paddingTop: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{item.title}</div>
            <div style={mutedStyle}>{item.subtitle}</div>
          </div>
        );
      })}
    </div>
  );
}

export function AppointmentBookingDashboardWidget(_props: PluginWidgetProps) {
  return (
    <section style={{ display: "grid", gap: 12 }}>
      <StatusPanel compact />
      <UpcomingList limit={3} />
    </section>
  );
}

export function AppointmentBookingPage(_props: PluginPageProps) {
  return (
    <main style={{ display: "grid", gap: 16, padding: 24 }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 22 }}>Appointment Booking</h1>
        <p style={{ ...mutedStyle, marginTop: 6 }}>
          Google Calendar connection, PaperClaw-stored bookings, and agent tools for appointments.
        </p>
      </header>
      <section style={panelStyle}>
        <StatusPanel />
      </section>
      <section style={panelStyle}>
        <h2 style={{ margin: "0 0 12px", fontSize: 16 }}>Upcoming appointments</h2>
        <UpcomingList limit={10} />
      </section>
    </main>
  );
}

export function AppointmentBookingSettingsPage(_props: PluginSettingsPageProps) {
  return (
    <section style={{ display: "grid", gap: 16 }}>
      <div style={panelStyle}>
        <h2 style={{ margin: "0 0 8px", fontSize: 16 }}>Connection</h2>
        <StatusPanel />
      </div>
      <div style={panelStyle}>
        <h2 style={{ margin: "0 0 8px", fontSize: 16 }}>Storage</h2>
        <div style={mutedStyle}>
          Live bookings are saved in PaperClaw plugin_state first and then synced to Google Calendar. Dry run does not save data.
        </div>
      </div>
      <div style={panelStyle}>
        <h2 style={{ margin: "0 0 8px", fontSize: 16 }}>Agent tools</h2>
        <div style={mutedStyle}>
          Agents can list stored bookings, find Google Calendar availability, create bookings, reschedule bookings, and cancel bookings.
        </div>
      </div>
    </section>
  );
}
