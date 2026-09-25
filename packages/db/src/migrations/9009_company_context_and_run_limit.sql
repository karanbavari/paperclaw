ALTER TABLE "company_profiles"
  ADD COLUMN IF NOT EXISTS "business_subcategory" text;

ALTER TABLE "companies"
  ADD COLUMN IF NOT EXISTS "max_concurrent_agent_runs" integer DEFAULT 10;

UPDATE "companies"
SET "max_concurrent_agent_runs" = 10
WHERE "max_concurrent_agent_runs" IS NULL;

-- PaperClaw retains these per-company presentation/upload controls even though
-- upstream migration 0229 retired them.
ALTER TABLE "companies"
  ADD COLUMN IF NOT EXISTS "attachment_max_bytes" integer DEFAULT 10485760 NOT NULL;

ALTER TABLE "companies"
  ADD COLUMN IF NOT EXISTS "brand_color" text;
