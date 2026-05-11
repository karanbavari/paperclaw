import { z } from "zod";

export const addDirectChatMessageSchema = z.object({
  body: z.string().trim().min(1).max(20_000),
});

export type AddDirectChatMessage = z.infer<typeof addDirectChatMessageSchema>;
