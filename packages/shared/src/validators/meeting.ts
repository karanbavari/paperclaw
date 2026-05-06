import { z } from "zod";

export const createMeetingSchema = z.object({
  title: z.string().trim().min(1).max(160),
  topic: z.string().trim().min(1).max(10_000),
  agentIds: z.array(z.string().uuid()).min(1).max(24),
});

export type CreateMeeting = z.infer<typeof createMeetingSchema>;

export const addMeetingMessageSchema = z.object({
  body: z.string().trim().min(1).max(20_000),
  targetAgentId: z.string().uuid().optional().nullable(),
});

export type AddMeetingMessage = z.infer<typeof addMeetingMessageSchema>;
