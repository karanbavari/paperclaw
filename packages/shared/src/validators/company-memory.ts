import { z } from "zod";
import {
  COMPANY_PROFILE_CURRENCY_OPTIONS,
  COMPANY_PROFILE_LANGUAGE_OPTIONS,
  COMPANY_PROFILE_TIMEZONE_OPTIONS,
  COMPANY_MEMORY_KINDS,
  COMPANY_MEMORY_SCOPE_TYPES,
  COMPANY_MEMORY_SOURCE_TYPES,
  COMPANY_MEMORY_STATUSES,
  COMPANY_MEMORY_TYPES,
} from "../types/company-memory.js";

const COMPANY_PROFILE_LANGUAGE_CODES = COMPANY_PROFILE_LANGUAGE_OPTIONS.map((option) => option.code) as [
  (typeof COMPANY_PROFILE_LANGUAGE_OPTIONS)[number]["code"],
  ...(typeof COMPANY_PROFILE_LANGUAGE_OPTIONS)[number]["code"][],
];
const COMPANY_PROFILE_CURRENCY_CODES = COMPANY_PROFILE_CURRENCY_OPTIONS.map((option) => option.code) as [
  (typeof COMPANY_PROFILE_CURRENCY_OPTIONS)[number]["code"],
  ...(typeof COMPANY_PROFILE_CURRENCY_OPTIONS)[number]["code"][],
];

const nullableTrimmedString = z.preprocess(
  (value) => (typeof value === "string" && value.trim().length === 0 ? null : value),
  z.string().trim().nullable().optional(),
);

export const updateCompanyProfileSchema = z.object({
  registeredSince: z.preprocess(
    (value) => (typeof value === "string" && value.trim().length === 0 ? null : value),
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  ),
  businessCategory: nullableTrimmedString,
  defaultLanguage: z.enum(COMPANY_PROFILE_LANGUAGE_CODES).nullable().optional(),
  defaultCurrency: z.enum(COMPANY_PROFILE_CURRENCY_CODES).nullable().optional(),
  website: nullableTrimmedString,
  contactEmail: nullableTrimmedString,
  contactPhone: nullableTrimmedString,
  contactAddress: nullableTrimmedString,
  timezone: z.enum(COMPANY_PROFILE_TIMEZONE_OPTIONS).nullable().optional(),
  businessSummary: nullableTrimmedString,
  targetCustomers: nullableTrimmedString,
  brandVoice: nullableTrimmedString,
  operatingNotes: nullableTrimmedString,
});

export type UpdateCompanyProfile = z.infer<typeof updateCompanyProfileSchema>;

const memoryTagsSchema = z.array(z.string().trim().min(1).max(48)).max(20).optional().default([]);

export const createCompanyMemoryItemSchema = z.object({
  memoryType: z.enum(COMPANY_MEMORY_TYPES).optional().default("long_term"),
  kind: z.enum(COMPANY_MEMORY_KINDS).optional().default("note"),
  status: z.enum(COMPANY_MEMORY_STATUSES).optional(),
  scopeType: z.enum(COMPANY_MEMORY_SCOPE_TYPES).optional().default("company"),
  scopeId: nullableTrimmedString,
  title: z.string().trim().min(1).max(180),
  body: z.string().trim().min(1).max(20_000),
  summary: nullableTrimmedString,
  tags: memoryTagsSchema,
  sourceType: z.enum(COMPANY_MEMORY_SOURCE_TYPES).optional().default("manual"),
  sourceId: nullableTrimmedString,
  confidence: z.number().int().min(0).max(100).optional().default(70),
  importance: z.number().int().min(0).max(100).optional().default(50),
  expiresAt: z.coerce.date().nullable().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
});

export type CreateCompanyMemoryItem = z.infer<typeof createCompanyMemoryItemSchema>;

export const updateCompanyMemoryItemSchema = createCompanyMemoryItemSchema.partial().extend({
  status: z.enum(COMPANY_MEMORY_STATUSES).optional(),
});

export type UpdateCompanyMemoryItem = z.infer<typeof updateCompanyMemoryItemSchema>;

function firstQueryValue(value: unknown): unknown {
  return Array.isArray(value) ? value[0] : value;
}

function intQuery(value: unknown, fallback: number, min: number, max: number) {
  const raw = firstQueryValue(value);
  const parsed = typeof raw === "string" ? Number.parseInt(raw, 10) : typeof raw === "number" ? raw : Number.NaN;
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(parsed)));
}

export const companyMemoryListQuerySchema = z.object({
  q: z.preprocess(firstQueryValue, z.string().optional().default("")),
  memoryType: z.preprocess(firstQueryValue, z.enum(COMPANY_MEMORY_TYPES).optional()),
  status: z.preprocess(firstQueryValue, z.enum(COMPANY_MEMORY_STATUSES).optional()),
  scopeType: z.preprocess(firstQueryValue, z.enum(COMPANY_MEMORY_SCOPE_TYPES).optional()),
  limit: z.unknown().optional().transform((value) => intQuery(value, 50, 1, 100)),
  offset: z.unknown().optional().transform((value) => intQuery(value, 0, 0, 500)),
});

export type CompanyMemoryListQuery = z.infer<typeof companyMemoryListQuerySchema>;

export const companyMemoryRecallSchema = z.object({
  query: z.string().trim().max(1_000).optional(),
  agentId: z.string().uuid().nullable().optional(),
  agentRole: z.string().trim().max(80).nullable().optional(),
  issueId: z.string().uuid().nullable().optional(),
  projectId: z.string().uuid().nullable().optional(),
  limit: z.number().int().min(1).max(20).optional().default(8),
});

export type CompanyMemoryRecallRequest = z.infer<typeof companyMemoryRecallSchema>;
