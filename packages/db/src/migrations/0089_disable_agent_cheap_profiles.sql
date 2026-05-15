UPDATE "agents"
SET "runtime_config" = jsonb_set(
  "runtime_config",
  '{modelProfiles,cheap,enabled}',
  'false'::jsonb,
  true
)
WHERE "runtime_config" ? 'modelProfiles'
  AND ("runtime_config" -> 'modelProfiles') ? 'cheap';
