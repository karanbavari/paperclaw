import { z } from "zod";

export const opsIncidentKindSchema = z.enum([
  "failed_run",
  "stuck_or_silent_run",
  "recovery_issue",
  "budget_incident",
  "plugin_failure",
  "workspace_runtime_unhealthy",
  "agent_error",
]);

export const opsIncidentSeveritySchema = z.enum(["critical", "high", "medium", "low"]);

export const opsIncidentStatusSchema = z.enum([
  "needs_action",
  "recovering",
  "monitoring",
  "resolved",
]);

const optionalQueryString = z.preprocess(
  (value) => Array.isArray(value) ? value[0] : value,
  z.string().trim().min(1).optional(),
);

export const opsIncidentQuerySchema = z.object({
  kind: z.preprocess(
    (value) => Array.isArray(value) ? value[0] : value,
    opsIncidentKindSchema.optional(),
  ),
  severity: z.preprocess(
    (value) => Array.isArray(value) ? value[0] : value,
    opsIncidentSeveritySchema.optional(),
  ),
  status: z.preprocess(
    (value) => Array.isArray(value) ? value[0] : value,
    opsIncidentStatusSchema.optional(),
  ),
  projectId: optionalQueryString,
  agentId: optionalQueryString,
  q: optionalQueryString,
  limit: z.preprocess(
    (value) => Array.isArray(value) ? value[0] : value,
    z.coerce.number().int().min(1).max(500).optional().default(100),
  ),
  offset: z.preprocess(
    (value) => Array.isArray(value) ? value[0] : value,
    z.coerce.number().int().min(0).optional().default(0),
  ),
});

export type OpsIncidentQuery = z.infer<typeof opsIncidentQuerySchema>;
