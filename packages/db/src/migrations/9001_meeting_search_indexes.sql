CREATE INDEX IF NOT EXISTS "meetings_title_search_idx" ON "meetings" USING gin ("title" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "meetings_topic_search_idx" ON "meetings" USING gin ("topic" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "meeting_messages_body_search_idx" ON "meeting_messages" USING gin ("body" gin_trgm_ops);
