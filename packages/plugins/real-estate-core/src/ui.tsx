import { useEffect, useMemo, useState } from "react";
import {
  useHostContext,
  usePluginAction,
  usePluginData,
  type PluginPageProps,
  type PluginSettingsPageProps,
  type PluginWidgetProps,
} from "@kesarcloud/plugin-sdk/ui";
import { realEstateActionKeys, realEstateDataKeys, type RealEstateDefinition } from "./shared.js";

type StatusData = {
  version: string;
  connected: boolean;
  authMode: "token" | "oauth";
  connectedAt: string | null;
  connectedAccountId: string | null;
  apiBaseUrlOverride?: string | null;
  dryRun: boolean;
  enableRawApiTool: boolean;
  scopes: string[];
  redirectUri: string | null;
  errors: string[];
  warnings: string[];
};

type RecentCommandsData = {
  commands: Array<{ operation: string; mutating: boolean; dryRun: boolean; ok: boolean; createdAt: string }>;
};

type PluginConfigResponse = { configJson?: Record<string, unknown> } | null;
type SecretUpsertResponse = { secretRef: string };
type OauthStartResponse = { authorizationUrl: string; state: string; redirectUri: string };
type OauthCompleteResponse = { refreshTokenSecretRef: string };

const panelStyle = { border: "1px solid var(--border, #d7d7d7)", background: "var(--card, #fff)", padding: 16 } as const;
const mutedStyle = { color: "var(--muted-foreground, #666)", fontSize: 13 } as const;
const inputStyle = { width: "100%", border: "1px solid var(--border, #d7d7d7)", background: "var(--background, #fff)", color: "var(--foreground, #111)", padding: "8px 10px", fontSize: 14 } as const;
const buttonStyle = { border: "1px solid var(--border, #d7d7d7)", background: "var(--primary, #111)", color: "var(--primary-foreground, #fff)", padding: "8px 12px", fontSize: 14, cursor: "pointer" } as const;

function inferRedirectUri() {
  if (typeof window === "undefined") return "";
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  return url.toString();
}

async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { ...init, headers: { accept: "application/json", ...(init?.body ? { "content-type": "application/json" } : {}), ...init?.headers } });
  const text = await response.text();
  const payload = text ? JSON.parse(text) as unknown : null;
  if (!response.ok) throw new Error(payload && typeof payload === "object" && typeof (payload as { error?: unknown }).error === "string" ? (payload as { error: string }).error : response.statusText);
  return payload as T;
}

export function createRealEstateUi(definition: RealEstateDefinition, pluginId: string) {
  async function loadConfig() {
    const response = await apiJson<PluginConfigResponse>(`/api/plugins/${encodeURIComponent(pluginId)}/config`);
    return response?.configJson ?? {};
  }

  async function saveConfig(configJson: Record<string, unknown>) {
    await apiJson(`/api/plugins/${encodeURIComponent(pluginId)}/config`, { method: "POST", body: JSON.stringify({ configJson }) });
  }

  function StatusPanel({ compact = false }: { compact?: boolean }) {
    const host = useHostContext();
    const status = usePluginData<StatusData>(realEstateDataKeys.status, { companyId: host.companyId });
    const data = status.data;
    if (status.loading) return <div style={mutedStyle}>Checking {definition.displayName} connector...</div>;
    if (status.error) return <div style={{ color: "var(--destructive, #b00020)", fontSize: 13 }}>{status.error.message}</div>;
    return (
      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <strong>{data?.connected ? `${definition.displayName} connected` : "Setup needed"}</strong>
          <span style={{ ...mutedStyle, border: "1px solid var(--border, #d7d7d7)", padding: "2px 6px" }}>{data?.dryRun ? "Dry run" : "Live"}</span>
        </div>
        {!compact ? (
          <>
            <div style={mutedStyle}>Auth: {data?.authMode === "oauth" ? "OAuth" : definition.tokenLabel}</div>
            <div style={mutedStyle}>{definition.connectedLabel}: {data?.connectedAccountId || "Not recorded"}</div>
            <div style={mutedStyle}>Connected: {data?.connectedAt ?? "Not connected"}</div>
            <div style={mutedStyle}>API host: {data?.apiBaseUrlOverride || definition.apiBaseUrl}</div>
            <div style={mutedStyle}>Redirect URI: {data?.redirectUri ?? inferRedirectUri()}</div>
            <div style={mutedStyle}>Raw API tool: {data?.enableRawApiTool ? "enabled" : "disabled"}</div>
            <div style={mutedStyle}>Scopes: {(data?.scopes ?? []).join(", ")}</div>
            <div style={mutedStyle}>Plugin version: {data?.version ?? "unknown"}</div>
          </>
        ) : null}
        {(data?.errors.length ?? 0) > 0 ? <div style={{ color: "var(--destructive, #b00020)", fontSize: 13 }}>{data!.errors.join(" ")}</div> : null}
        {(data?.warnings.length ?? 0) > 0 ? <div style={mutedStyle}>{data!.warnings.join(" ")}</div> : null}
      </div>
    );
  }

  function RecentCommands() {
    const host = useHostContext();
    const recent = usePluginData<RecentCommandsData>(realEstateDataKeys.recentCommands, { companyId: host.companyId });
    if (recent.loading) return <div style={mutedStyle}>Loading recent {definition.displayName} requests...</div>;
    if (recent.error) return <div style={mutedStyle}>Recent audit is unavailable.</div>;
    const commands = recent.data?.commands ?? [];
    if (commands.length === 0) return <div style={mutedStyle}>No {definition.displayName} requests have been run yet.</div>;
    return (
      <div style={{ display: "grid", gap: 8 }}>
        {commands.map((command, index) => (
          <div key={`${command.createdAt}-${index}`} style={{ borderTop: "1px solid var(--border, #d7d7d7)", paddingTop: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{command.operation}</div>
            <div style={mutedStyle}>{command.ok ? "ok" : "failed"} / {command.dryRun ? "dry run" : "live"} / {command.mutating ? "mutating" : "read"} / {command.createdAt}</div>
          </div>
        ))}
      </div>
    );
  }

  function SetupForm() {
    const host = useHostContext();
    const saveAccessToken = usePluginAction(realEstateActionKeys.saveAccessToken);
    const saveClientSecret = usePluginAction(realEstateActionKeys.saveClientSecret);
    const startOauth = usePluginAction(realEstateActionKeys.startOauth);
    const completeOauth = usePluginAction(realEstateActionKeys.completeOauth);
    const status = usePluginData<StatusData>(realEstateDataKeys.status, { companyId: host.companyId });
    const [authMode, setAuthMode] = useState<"token" | "oauth">("token");
    const [accessToken, setAccessToken] = useState("");
    const [apiBaseUrlOverride, setApiBaseUrlOverride] = useState("");
    const [accessTokenSecretRef, setAccessTokenSecretRef] = useState("");
    const [clientId, setClientId] = useState("");
    const [clientSecret, setClientSecret] = useState("");
    const [clientSecretRef, setClientSecretRef] = useState("");
    const [refreshTokenSecretRef, setRefreshTokenSecretRef] = useState("");
    const [connectedAccountId, setConnectedAccountId] = useState("");
    const [redirectUri, setRedirectUri] = useState(inferRedirectUri());
    const [dryRun, setDryRun] = useState(true);
    const [enableRawApiTool, setEnableRawApiTool] = useState(false);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
      let cancelled = false;
      void loadConfig().then((config) => {
        if (cancelled) return;
        setAuthMode(config.authMode === "oauth" ? "oauth" : "token");
        setApiBaseUrlOverride(String(config.apiBaseUrlOverride ?? ""));
        setAccessTokenSecretRef(String(config.accessTokenSecretRef ?? ""));
        setClientId(String(config.clientId ?? ""));
        setClientSecretRef(String(config.clientSecretRef ?? ""));
        setRefreshTokenSecretRef(String(config.refreshTokenSecretRef ?? ""));
        setConnectedAccountId(String(config.connectedAccountId ?? ""));
        setRedirectUri(String(config.redirectUri ?? "") || inferRedirectUri());
        setDryRun(typeof config.dryRun === "boolean" ? config.dryRun : true);
        setEnableRawApiTool(typeof config.enableRawApiTool === "boolean" ? config.enableRawApiTool : false);
      }).catch((err) => setError(err instanceof Error ? err.message : `Unable to load ${definition.displayName} config.`));
      return () => {
        cancelled = true;
      };
    }, []);
    const oauthCode = useMemo(() => typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("code"), []);
    async function persistBaseConfig(next: Partial<Record<string, unknown>> = {}) {
      if (!host.companyId) throw new Error(`Select a company before configuring ${definition.displayName}.`);
      let nextAccessTokenRef = accessTokenSecretRef;
      let nextClientSecretRef = clientSecretRef;
      if (accessToken.trim()) {
        const secret = await saveAccessToken({ companyId: host.companyId, accessToken: accessToken.trim() }) as SecretUpsertResponse;
        nextAccessTokenRef = secret.secretRef;
        setAccessTokenSecretRef(nextAccessTokenRef);
        setAccessToken("");
      }
      if (clientSecret.trim()) {
        const secret = await saveClientSecret({ companyId: host.companyId, clientSecret: clientSecret.trim() }) as SecretUpsertResponse;
        nextClientSecretRef = secret.secretRef;
        setClientSecretRef(nextClientSecretRef);
        setClientSecret("");
      }
      const configJson = {
        authMode,
        apiBaseUrlOverride: apiBaseUrlOverride.trim(),
        accessTokenSecretRef: nextAccessTokenRef,
        clientId: clientId.trim(),
        clientSecretRef: nextClientSecretRef,
        refreshTokenSecretRef,
        connectedCompanyId: host.companyId,
        connectedAccountId,
        redirectUri: redirectUri.trim() || inferRedirectUri(),
        enabledScopes: definition.defaultScopes,
        dryRun,
        enableRawApiTool,
        requestTimeoutMs: 30_000,
        maxOutputBytes: 80_000,
        ...next,
      };
      await saveConfig(configJson);
      return configJson;
    }
    async function saveOnly() {
      try {
        setBusy(true);
        setError(null);
        await persistBaseConfig();
        setMessage(`${definition.displayName} settings saved.`);
        status.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : `Unable to save ${definition.displayName} settings.`);
      } finally {
        setBusy(false);
      }
    }
    async function connectOauth() {
      try {
        setBusy(true);
        setError(null);
        const configJson = await persistBaseConfig({ authMode: "oauth" });
        const result = await startOauth({ clientId: clientId.trim(), clientSecretRef: configJson.clientSecretRef, redirectUri: redirectUri.trim() || inferRedirectUri(), enabledScopes: definition.defaultScopes }) as OauthStartResponse;
        window.localStorage.setItem(`paperclaw.${definition.routePath}.oauth`, JSON.stringify({ state: result.state, redirectUri: result.redirectUri }));
        window.location.assign(result.authorizationUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : `Unable to start ${definition.displayName} OAuth.`);
      } finally {
        setBusy(false);
      }
    }
    async function finishOauth() {
      try {
        if (!host.companyId) throw new Error(`Select a company before completing ${definition.displayName} OAuth.`);
        if (!oauthCode) throw new Error(`No ${definition.displayName} OAuth code found in the current URL.`);
        setBusy(true);
        setError(null);
        const stored = JSON.parse(window.localStorage.getItem(`paperclaw.${definition.routePath}.oauth`) ?? "{}") as { state?: string; redirectUri?: string };
        const returnedState = new URLSearchParams(window.location.search).get("state");
        if (stored.state && returnedState && stored.state !== returnedState) throw new Error(`${definition.displayName} OAuth state did not match.`);
        if (!stored.redirectUri) throw new Error(`Missing OAuth redirect URI. Start the ${definition.displayName} connection again.`);
        const result = await completeOauth({ companyId: host.companyId, clientId: clientId.trim(), clientSecretRef, code: oauthCode, redirectUri: stored.redirectUri }) as OauthCompleteResponse;
        setRefreshTokenSecretRef(result.refreshTokenSecretRef);
        await persistBaseConfig({ authMode: "oauth", refreshTokenSecretRef: result.refreshTokenSecretRef, connectedAt: new Date().toISOString() });
        window.localStorage.removeItem(`paperclaw.${definition.routePath}.oauth`);
        const url = new URL(window.location.href);
        url.searchParams.delete("code");
        url.searchParams.delete("state");
        window.history.replaceState(null, "", url.toString());
        setMessage(`${definition.displayName} OAuth connection saved.`);
        status.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : `Unable to complete ${definition.displayName} OAuth.`);
      } finally {
        setBusy(false);
      }
    }
    return (
      <div style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 4, fontSize: 13 }}>Auth Mode<select style={inputStyle} value={authMode} onChange={(event) => setAuthMode(event.target.value === "oauth" ? "oauth" : "token")} disabled={busy}><option value="token">{definition.tokenLabel}</option><option value="oauth">OAuth app</option></select></label>
        {authMode === "token" ? <label style={{ display: "grid", gap: 4, fontSize: 13 }}>{definition.tokenLabel}<input style={inputStyle} type="password" value={accessToken} onChange={(event) => setAccessToken(event.target.value)} disabled={busy} placeholder={accessTokenSecretRef ? "Token already saved" : ""} /></label> : (
          <>
            <label style={{ display: "grid", gap: 4, fontSize: 13 }}>OAuth Client ID<input style={inputStyle} value={clientId} onChange={(event) => setClientId(event.target.value)} disabled={busy} /></label>
            <label style={{ display: "grid", gap: 4, fontSize: 13 }}>OAuth Client Secret<input style={inputStyle} type="password" value={clientSecret} onChange={(event) => setClientSecret(event.target.value)} disabled={busy} placeholder={clientSecretRef ? "Secret already saved" : ""} /></label>
            <label style={{ display: "grid", gap: 4, fontSize: 13 }}>Redirect URI<input style={inputStyle} value={redirectUri} onChange={(event) => setRedirectUri(event.target.value)} disabled={busy} /></label>
          </>
        )}
        <label style={{ display: "grid", gap: 4, fontSize: 13 }}>{definition.apiBaseUrlLabel ?? "API Base URL Override"}<input style={inputStyle} value={apiBaseUrlOverride} onChange={(event) => setApiBaseUrlOverride(event.target.value)} disabled={busy} placeholder={definition.apiBaseUrl} /></label>
        <label style={{ display: "grid", gap: 4, fontSize: 13 }}>{definition.connectedLabel}<input style={inputStyle} value={connectedAccountId} onChange={(event) => setConnectedAccountId(event.target.value)} disabled={busy} /></label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}><input type="checkbox" checked={dryRun} onChange={(event) => setDryRun(event.target.checked)} disabled={busy} />Dry run mutating tools</label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}><input type="checkbox" checked={enableRawApiTool} onChange={(event) => setEnableRawApiTool(event.target.checked)} disabled={busy} />Enable guarded raw API tool</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><button type="button" style={buttonStyle} onClick={saveOnly} disabled={busy || !host.companyId}>Save Settings</button>{authMode === "oauth" ? <button type="button" style={buttonStyle} onClick={connectOauth} disabled={busy || !host.companyId}>Connect OAuth</button> : null}{authMode === "oauth" && oauthCode ? <button type="button" style={buttonStyle} onClick={finishOauth} disabled={busy || !host.companyId}>Finish OAuth</button> : null}</div>
        {message ? <div style={mutedStyle}>{message}</div> : null}
        {error ? <div style={{ color: "var(--destructive, #b00020)", fontSize: 13 }}>{error}</div> : null}
      </div>
    );
  }

  function RealEstateDashboardWidget(_props: PluginWidgetProps) {
    return <section style={{ display: "grid", gap: 12 }}><StatusPanel compact /><RecentCommands /></section>;
  }

  function RealEstatePage(_props: PluginPageProps) {
    return (
      <main style={{ display: "grid", gap: 16, maxWidth: 920 }}>
        <section style={panelStyle}><StatusPanel /></section>
        <section style={panelStyle}><h2 style={{ margin: "0 0 12px", fontSize: 18 }}>Recent Requests</h2><RecentCommands /></section>
        <section style={panelStyle}><h2 style={{ margin: "0 0 12px", fontSize: 18 }}>Available Tool Groups</h2><div style={{ display: "grid", gap: 8, fontSize: 14 }}><div>{definition.description}</div><div>Core tools include read/search/list plus dry-run protected write operations.</div><div>Keep dry run enabled while agents prepare real estate workspace changes.</div><div>These tools operate real estate records and documents; they do not provide real estate advice.</div></div></section>
      </main>
    );
  }

  function RealEstateSettingsPage(_props: PluginSettingsPageProps) {
    return <main style={{ display: "grid", gap: 16, maxWidth: 760 }}><section style={panelStyle}><h2 style={{ margin: "0 0 12px", fontSize: 18 }}>{definition.displayName} Setup</h2><SetupForm /></section><section style={panelStyle}><StatusPanel /></section></main>;
  }

  return { RealEstateDashboardWidget, RealEstatePage, RealEstateSettingsPage };
}
