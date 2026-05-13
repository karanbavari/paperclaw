import type {
  EffectiveToolPermission,
  ReplaceToolPermissionPoliciesRequest,
  ToolPermissionDecisionRecord,
  ToolPermissionListResponse,
} from "@kesarcloud/shared";
import { api } from "./client";

export const toolPermissionsApi = {
  list: (companyId: string) =>
    api.get<ToolPermissionListResponse>(`/companies/${companyId}/tool-permissions`),
  replace: (companyId: string, data: ReplaceToolPermissionPoliciesRequest) =>
    api.put<ToolPermissionListResponse>(`/companies/${companyId}/tool-permissions`, data),
  effective: (companyId: string, query: { agentId?: string; pluginKey: string; toolName: string }) => {
    const params = new URLSearchParams();
    if (query.agentId) params.set("agentId", query.agentId);
    params.set("pluginKey", query.pluginKey);
    params.set("toolName", query.toolName);
    return api.get<EffectiveToolPermission>(`/companies/${companyId}/tool-permissions/effective?${params.toString()}`);
  },
  decisions: (companyId: string, limit = 50) =>
    api.get<ToolPermissionDecisionRecord[]>(`/companies/${companyId}/tool-permission-decisions?limit=${limit}`),
};
