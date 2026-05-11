CREATE TABLE IF NOT EXISTS "direct_chat_threads" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "company_id" uuid NOT NULL REFERENCES "companies"("id") ON DELETE cascade,
  "kind" text DEFAULT 'board_ceo' NOT NULL,
  "ceo_agent_id" uuid NOT NULL REFERENCES "agents"("id") ON DELETE cascade,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "direct_chat_threads_company_kind_ceo_uq"
  ON "direct_chat_threads" ("company_id", "kind", "ceo_agent_id");

CREATE INDEX IF NOT EXISTS "direct_chat_threads_company_updated_idx"
  ON "direct_chat_threads" ("company_id", "updated_at");

CREATE TABLE IF NOT EXISTS "direct_chat_messages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "company_id" uuid NOT NULL REFERENCES "companies"("id") ON DELETE cascade,
  "thread_id" uuid NOT NULL REFERENCES "direct_chat_threads"("id") ON DELETE cascade,
  "author_type" text NOT NULL,
  "author_user_id" text,
  "author_agent_id" uuid REFERENCES "agents"("id") ON DELETE set null,
  "body" text DEFAULT '' NOT NULL,
  "status" text DEFAULT 'completed' NOT NULL,
  "error" text,
  "run_id" uuid REFERENCES "heartbeat_runs"("id") ON DELETE set null,
  "in_reply_to_message_id" uuid,
  "metadata" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "direct_chat_messages_thread_created_idx"
  ON "direct_chat_messages" ("thread_id", "created_at");

CREATE INDEX IF NOT EXISTS "direct_chat_messages_company_thread_status_idx"
  ON "direct_chat_messages" ("company_id", "thread_id", "status");

CREATE INDEX IF NOT EXISTS "direct_chat_messages_run_idx"
  ON "direct_chat_messages" ("run_id");
