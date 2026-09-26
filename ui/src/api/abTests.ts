import type { AbFeedbackPage, AbRun, AbStudy, AbStudyDetail, CreateAbStudy, UpdateAbStudy } from "@kesarcloud/shared";
import { api } from "./client";

const base = (companyId: string) => `/companies/${encodeURIComponent(companyId)}/ab-tests`;
const item = (companyId: string, studyId: string) => `${base(companyId)}/${encodeURIComponent(studyId)}`;

export const abTestsApi = {
  list: (companyId: string) => api.get<AbStudy[]>(base(companyId)),
  get: (companyId: string, studyId: string) => api.get<AbStudyDetail>(item(companyId, studyId)),
  create: (companyId: string, data: CreateAbStudy) => api.post<AbStudy>(base(companyId), data),
  update: (companyId: string, studyId: string, data: UpdateAbStudy) => api.patch<AbStudy>(item(companyId, studyId), data),
  preview: (companyId: string, studyId: string) => api.post<AbStudy>(`${item(companyId, studyId)}/preview`, {}),
  requestRun: (companyId: string, studyId: string, targetCount = 30) => api.post<AbRun>(`${item(companyId, studyId)}/runs`, { targetCount }),
  approve: (companyId: string, studyId: string, runId: string, agentId: string) =>
    api.post<AbRun>(`${item(companyId, studyId)}/runs/${runId}/approve`, { agentId, acknowledgeSynthetic: true, acknowledgeCost: true }),
  cancel: (companyId: string, studyId: string, runId: string) =>
    api.post<AbRun>(`${item(companyId, studyId)}/runs/${runId}/cancel`, {}),
  personas: (companyId: string, studyId: string, cursor?: number) => {
    const params = new URLSearchParams({ limit: "30" });
    if (cursor !== undefined) params.set("cursor", String(cursor));
    return api.get<{ items: Array<{ id: string; ordinal: number; segment: string; profile: Record<string, unknown>; assignedVariant: string }>; nextCursor: number | null }>(`${item(companyId, studyId)}/personas?${params}`);
  },
  feedback: (companyId: string, studyId: string, runId: string, options: { variant?: "A" | "B"; band?: string; cursor?: number; limit?: number }) => {
    const params = new URLSearchParams({ runId, limit: String(options.limit ?? 60) });
    if (options.variant) params.set("variant", options.variant);
    if (options.band) params.set("band", options.band);
    if (options.cursor !== undefined) params.set("cursor", String(options.cursor));
    return api.get<AbFeedbackPage>(`${item(companyId, studyId)}/feedback?${params}`);
  },
};
