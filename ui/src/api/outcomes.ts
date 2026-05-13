import type { OutcomeCenterFilters, OutcomeCenterSummary } from "@kesarcloud/shared";
import { api } from "./client";

function appendParam(params: URLSearchParams, key: string, value: string | number | undefined | null) {
  if (value === undefined || value === null || value === "") return;
  params.set(key, String(value));
}

export const outcomesApi = {
  summary: (companyId: string, filters: OutcomeCenterFilters = {}) => {
    const params = new URLSearchParams();
    appendParam(params, "type", filters.type);
    appendParam(params, "status", filters.status);
    appendParam(params, "reviewState", filters.reviewState);
    appendParam(params, "projectId", filters.projectId);
    appendParam(params, "q", filters.q);
    appendParam(params, "limit", filters.limit);
    const qs = params.toString();
    return api.get<OutcomeCenterSummary>(`/companies/${companyId}/outcomes${qs ? `?${qs}` : ""}`);
  },
};
