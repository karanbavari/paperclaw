import type { OpsIncidentFilters, OpsIncidentSummary } from "@kesarcloud/shared";
import { api } from "./client";

function appendParam(params: URLSearchParams, key: string, value: string | number | undefined | null) {
  if (value === undefined || value === null || value === "") return;
  params.set(key, String(value));
}

export const opsIncidentsApi = {
  summary: (companyId: string, filters: OpsIncidentFilters = {}) => {
    const params = new URLSearchParams();
    appendParam(params, "kind", filters.kind);
    appendParam(params, "severity", filters.severity);
    appendParam(params, "status", filters.status);
    appendParam(params, "projectId", filters.projectId);
    appendParam(params, "agentId", filters.agentId);
    appendParam(params, "q", filters.q);
    appendParam(params, "limit", filters.limit);
    appendParam(params, "offset", filters.offset);
    const qs = params.toString();
    return api.get<OpsIncidentSummary>(`/companies/${companyId}/ops-incidents${qs ? `?${qs}` : ""}`);
  },
};
