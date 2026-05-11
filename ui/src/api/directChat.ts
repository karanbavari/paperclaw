import type { DirectChatDetail } from "@kesarcloud/shared";
import { api } from "./client";

export const directChatApi = {
  get: (companyId: string) =>
    api.get<DirectChatDetail>(`/companies/${companyId}/direct-chat`),
  addMessage: (companyId: string, data: { body: string }) =>
    api.post<DirectChatDetail>(`/companies/${companyId}/direct-chat/messages`, data),
};
