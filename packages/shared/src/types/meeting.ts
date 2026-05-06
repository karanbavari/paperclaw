import type { Agent } from "./agent.js";

export type MeetingStatus = "open" | "closed";
export type MeetingParticipantStatus = "active" | "removed";
export type MeetingMessageAuthorType = "board" | "agent" | "system";
export type MeetingMessageStatus = "queued" | "running" | "completed" | "failed";

export interface MeetingSummary {
  id: string;
  companyId: string;
  title: string;
  topic: string;
  status: MeetingStatus;
  markdownPath: string;
  participantCount: number;
  latestMessageAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MeetingParticipant {
  id: string;
  companyId: string;
  meetingId: string;
  agentId: string;
  position: number;
  status: MeetingParticipantStatus;
  agent: Agent | null;
  createdAt: Date;
}

export interface MeetingMessage {
  id: string;
  companyId: string;
  meetingId: string;
  roundNumber: number;
  authorType: MeetingMessageAuthorType;
  authorUserId: string | null;
  authorAgentId: string | null;
  authorAgent: Agent | null;
  body: string;
  status: MeetingMessageStatus;
  error: string | null;
  runId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MeetingDetail extends MeetingSummary {
  participants: MeetingParticipant[];
  messages: MeetingMessage[];
}
