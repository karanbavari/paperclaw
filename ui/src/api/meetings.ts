import type { MeetingDetail, MeetingMessage, MeetingSummary } from "@kesarcloud/shared";
import { api } from "./client";

export const meetingsApi = {
  list: (companyId: string) =>
    api.get<MeetingSummary[]>(`/companies/${companyId}/meetings`),
  get: (companyId: string, meetingId: string) =>
    api.get<MeetingDetail>(`/companies/${companyId}/meetings/${meetingId}`),
  create: (companyId: string, data: { title: string; topic: string; agentIds: string[] }) =>
    api.post<MeetingDetail>(`/companies/${companyId}/meetings`, data),
  addMessage: (companyId: string, meetingId: string, data: { body: string; targetAgentId?: string | null }) =>
    api.post<MeetingDetail>(`/companies/${companyId}/meetings/${meetingId}/messages`, data),
};
