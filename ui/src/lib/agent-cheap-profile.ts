import type { AgentModelProfileOverlay } from "./agent-config-patch";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function deriveCheapProfileState(input: {
  runtimeConfig: Record<string, unknown>;
  overlay?: AgentModelProfileOverlay;
}): { enabled: boolean; model: string } {
  const profiles = isRecord(input.runtimeConfig.modelProfiles)
    ? input.runtimeConfig.modelProfiles
    : {};
  const cheap = isRecord(profiles.cheap) ? profiles.cheap : {};
  const adapterConfig = isRecord(cheap.adapterConfig) ? cheap.adapterConfig : {};
  const overlayAdapterConfig = isRecord(input.overlay?.adapterConfig)
    ? input.overlay.adapterConfig
    : {};
  const overlayModel = overlayAdapterConfig.model;

  return {
    enabled: input.overlay?.enabled ?? (cheap.enabled === true),
    model: typeof overlayModel === "string"
      ? overlayModel
      : typeof adapterConfig.model === "string"
        ? adapterConfig.model
        : "",
  };
}
