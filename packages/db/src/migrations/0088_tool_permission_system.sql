CREATE TABLE IF NOT EXISTS "tool_permission_policies" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "company_id" uuid NOT NULL REFERENCES "companies"("id") ON DELETE cascade,
  "subject_type" text NOT NULL,
  "subject_id" uuid REFERENCES "agents"("id") ON DELETE cascade,
  "plugin_key" text,
  "tool_name" text,
  "effect" text NOT NULL,
  "budget_limit" jsonb,
  "enabled" boolean DEFAULT true NOT NULL,
  "created_by_user_id" text,
  "updated_by_user_id" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "tool_permission_policies_company_subject_idx"
  ON "tool_permission_policies" ("company_id", "subject_type", "subject_id");

CREATE INDEX IF NOT EXISTS "tool_permission_policies_company_tool_idx"
  ON "tool_permission_policies" ("company_id", "plugin_key", "tool_name");

CREATE TABLE IF NOT EXISTS "tool_permission_decisions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "company_id" uuid NOT NULL REFERENCES "companies"("id") ON DELETE cascade,
  "agent_id" uuid REFERENCES "agents"("id") ON DELETE set null,
  "run_id" uuid REFERENCES "heartbeat_runs"("id") ON DELETE set null,
  "plugin_key" text NOT NULL,
  "tool_name" text NOT NULL,
  "namespaced_tool" text NOT NULL,
  "invocation_kind" text DEFAULT 'agent_run' NOT NULL,
  "decision" text NOT NULL,
  "policy_id" uuid REFERENCES "tool_permission_policies"("id") ON DELETE set null,
  "approval_id" uuid REFERENCES "approvals"("id") ON DELETE set null,
  "reason" text,
  "parameter_hash" text,
  "estimated_cost_cents" integer,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "tool_permission_decisions_company_created_idx"
  ON "tool_permission_decisions" ("company_id", "created_at");

CREATE INDEX IF NOT EXISTS "tool_permission_decisions_company_agent_idx"
  ON "tool_permission_decisions" ("company_id", "agent_id");

CREATE INDEX IF NOT EXISTS "tool_permission_decisions_company_tool_idx"
  ON "tool_permission_decisions" ("company_id", "plugin_key", "tool_name");

CREATE INDEX IF NOT EXISTS "tool_permission_decisions_approval_idx"
  ON "tool_permission_decisions" ("approval_id");
