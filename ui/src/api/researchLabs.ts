import type {
  CreateResearchLab,
  ResearchLabDecision,
  ResearchLabDetail,
  ResearchLabListItem,
  ResearchLabSubmit,
  UpdateResearchLab,
} from "@kesarcloud/shared";
import { api } from "./client";

export const researchLabsApi = {
  list: (companyId: string) =>
    api.get<ResearchLabListItem[]>(`/companies/${companyId}/research-labs`),
  get: (companyId: string, labId: string) =>
    api.get<ResearchLabDetail>(`/companies/${companyId}/research-labs/${labId}`),
  create: (companyId: string, data: CreateResearchLab) =>
    api.post<ResearchLabDetail>(`/companies/${companyId}/research-labs`, data),
  update: (companyId: string, labId: string, data: UpdateResearchLab) =>
    api.patch<ResearchLabDetail>(`/companies/${companyId}/research-labs/${labId}`, data),
  submitToCeo: (companyId: string, labId: string, data: ResearchLabSubmit = {}) =>
    api.post<ResearchLabDetail>(`/companies/${companyId}/research-labs/${labId}/submit-ceo`, data),
  submitToBoard: (companyId: string, labId: string, data: ResearchLabSubmit = {}) =>
    api.post<ResearchLabDetail>(`/companies/${companyId}/research-labs/${labId}/submit-board`, data),
  archive: (companyId: string, labId: string, data: ResearchLabDecision = {}) =>
    api.post<ResearchLabDetail>(`/companies/${companyId}/research-labs/${labId}/archive`, data),
  trash: (companyId: string, labId: string, data: ResearchLabDecision = {}) =>
    api.post<ResearchLabDetail>(`/companies/${companyId}/research-labs/${labId}/trash`, data),
};
