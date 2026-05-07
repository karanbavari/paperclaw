CREATE TABLE IF NOT EXISTS "company_profiles" (
  "company_id" uuid PRIMARY KEY NOT NULL REFERENCES "companies"("id") ON DELETE cascade,
  "registered_since" date,
  "business_category" text,
  "default_language" text,
  "default_currency" text,
  "website" text,
  "contact_email" text,
  "contact_phone" text,
  "contact_address" text,
  "timezone" text,
  "business_summary" text,
  "target_customers" text,
  "brand_voice" text,
  "operating_notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "company_memory_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "company_id" uuid NOT NULL REFERENCES "companies"("id") ON DELETE cascade,
  "memory_type" text DEFAULT 'long_term' NOT NULL,
  "kind" text DEFAULT 'note' NOT NULL,
  "status" text DEFAULT 'proposed' NOT NULL,
  "scope_type" text DEFAULT 'company' NOT NULL,
  "scope_id" text,
  "title" text NOT NULL,
  "body" text NOT NULL,
  "summary" text,
  "tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "source_type" text DEFAULT 'manual' NOT NULL,
  "source_id" text,
  "created_by_user_id" text,
  "created_by_agent_id" uuid REFERENCES "agents"("id") ON DELETE set null,
  "approved_by_user_id" text,
  "approved_by_agent_id" uuid REFERENCES "agents"("id") ON DELETE set null,
  "approved_at" timestamp with time zone,
  "confidence" integer DEFAULT 70 NOT NULL,
  "importance" integer DEFAULT 50 NOT NULL,
  "expires_at" timestamp with time zone,
  "last_used_at" timestamp with time zone,
  "metadata" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "company_memory_items_company_status_idx"
  ON "company_memory_items" ("company_id", "status");
CREATE INDEX IF NOT EXISTS "company_memory_items_company_type_idx"
  ON "company_memory_items" ("company_id", "memory_type");
CREATE INDEX IF NOT EXISTS "company_memory_items_company_scope_idx"
  ON "company_memory_items" ("company_id", "scope_type", "scope_id");
CREATE INDEX IF NOT EXISTS "company_memory_items_company_updated_idx"
  ON "company_memory_items" ("company_id", "updated_at");
CREATE INDEX IF NOT EXISTS "company_memory_items_expires_idx"
  ON "company_memory_items" ("company_id", "expires_at");
CREATE INDEX IF NOT EXISTS "company_memory_items_title_search_idx"
  ON "company_memory_items" USING gin ("title" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "company_memory_items_body_search_idx"
  ON "company_memory_items" USING gin ("body" gin_trgm_ops);
