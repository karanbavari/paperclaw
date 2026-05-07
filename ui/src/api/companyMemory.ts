import type {
  CompanyMemoryItem,
  CompanyMemoryListQuery,
  CompanyMemoryListResponse,
  CompanyMemoryRecallRequest,
  CompanyMemoryRecallResponse,
  CompanyProfile,
  CreateCompanyMemoryItem,
  UpdateCompanyMemoryItem,
  UpdateCompanyProfile,
} from "@kesarcloud/shared";
import { api } from "./client";

function memoryQueryString(query: Partial<CompanyMemoryListQuery>) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.memoryType) params.set("memoryType", query.memoryType);
  if (query.status) params.set("status", query.status);
  if (query.scopeType) params.set("scopeType", query.scopeType);
  if (query.limit) params.set("limit", String(query.limit));
  if (query.offset) params.set("offset", String(query.offset));
  const value = params.toString();
  return value ? `?${value}` : "";
}

export const companyMemoryApi = {
  getProfile: (companyId: string) =>
    api.get<CompanyProfile | null>(`/companies/${companyId}/profile`),
  updateProfile: (companyId: string, data: UpdateCompanyProfile) =>
    api.patch<CompanyProfile>(`/companies/${companyId}/profile`, data),
  list: (companyId: string, query: Partial<CompanyMemoryListQuery> = {}) =>
    api.get<CompanyMemoryListResponse>(`/companies/${companyId}/memory${memoryQueryString(query)}`),
  create: (companyId: string, data: CreateCompanyMemoryItem) =>
    api.post<CompanyMemoryItem>(`/companies/${companyId}/memory`, data),
  update: (companyId: string, memoryId: string, data: UpdateCompanyMemoryItem) =>
    api.patch<CompanyMemoryItem>(`/companies/${companyId}/memory/${memoryId}`, data),
  approve: (companyId: string, memoryId: string) =>
    api.post<CompanyMemoryItem>(`/companies/${companyId}/memory/${memoryId}/approve`, {}),
  archive: (companyId: string, memoryId: string) =>
    api.post<CompanyMemoryItem>(`/companies/${companyId}/memory/${memoryId}/archive`, {}),
  recall: (companyId: string, data: CompanyMemoryRecallRequest) =>
    api.post<CompanyMemoryRecallResponse>(`/companies/${companyId}/memory/recall`, data),
};
