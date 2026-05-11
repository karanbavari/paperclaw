import type { Agent } from "./agent.js";

export type DirectChatThreadKind = "board_ceo";
export type DirectChatMessageAuthorType = "board" | "agent" | "system";
export type DirectChatMessageStatus = "queued" | "running" | "completed" | "failed";

export interface DirectChatThread {
  id: string;
  companyId: string;
  kind: DirectChatThreadKind;
  ceoAgentId: string;
  ceoAgent: Agent | null;
  latestMessageAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DirectChatMessage {
  id: string;
  companyId: string;
  threadId: string;
  authorType: DirectChatMessageAuthorType;
  authorUserId: string | null;
  authorAgentId: string | null;
  authorAgent: Agent | null;
  body: string;
  status: DirectChatMessageStatus;
  error: string | null;
  runId: string | null;
  inReplyToMessageId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DirectChatDetail extends DirectChatThread {
  messages: DirectChatMessage[];
}
