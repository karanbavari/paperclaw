ALTER TABLE "company_profiles"
  ADD COLUMN IF NOT EXISTS "business_subcategory" text;

ALTER TABLE "companies"
  ADD COLUMN IF NOT EXISTS "max_concurrent_agent_runs" integer DEFAULT 10;

UPDATE "companies"
SET "max_concurrent_agent_runs" = 10
WHERE "max_concurrent_agent_runs" IS NULL;
