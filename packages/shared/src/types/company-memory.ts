export const COMPANY_MEMORY_TYPES = ["profile", "short_term", "long_term", "knowledge"] as const;
export type CompanyMemoryType = (typeof COMPANY_MEMORY_TYPES)[number];

export const COMPANY_MEMORY_KINDS = [
  "fact",
  "policy",
  "preference",
  "procedure",
  "decision",
  "contact",
  "note",
] as const;
export type CompanyMemoryKind = (typeof COMPANY_MEMORY_KINDS)[number];

export const COMPANY_MEMORY_STATUSES = ["proposed", "active", "approved", "archived", "superseded"] as const;
export type CompanyMemoryStatus = (typeof COMPANY_MEMORY_STATUSES)[number];

export const COMPANY_MEMORY_SCOPE_TYPES = ["company", "agent", "project", "issue", "department", "customer"] as const;
export type CompanyMemoryScopeType = (typeof COMPANY_MEMORY_SCOPE_TYPES)[number];

export const COMPANY_MEMORY_SOURCE_TYPES = [
  "manual",
  "profile",
  "issue",
  "issue_comment",
  "document",
  "meeting",
  "run_summary",
  "agent_proposal",
] as const;
export type CompanyMemorySourceType = (typeof COMPANY_MEMORY_SOURCE_TYPES)[number];

export const COMPANY_PROFILE_LANGUAGE_OPTIONS = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "it", label: "Italian" },
  { code: "pt", label: "Portuguese" },
  { code: "ru", label: "Russian" },
  { code: "zh", label: "Chinese" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "ar", label: "Arabic" },
  { code: "bn", label: "Bengali" },
  { code: "ur", label: "Urdu" },
  { code: "pa", label: "Punjabi" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
  { code: "mr", label: "Marathi" },
  { code: "gu", label: "Gujarati" },
  { code: "kn", label: "Kannada" },
  { code: "ml", label: "Malayalam" },
  { code: "tr", label: "Turkish" },
  { code: "vi", label: "Vietnamese" },
  { code: "th", label: "Thai" },
  { code: "id", label: "Indonesian" },
  { code: "ms", label: "Malay" },
  { code: "fa", label: "Persian" },
  { code: "he", label: "Hebrew" },
  { code: "nl", label: "Dutch" },
  { code: "sv", label: "Swedish" },
  { code: "no", label: "Norwegian" },
  { code: "da", label: "Danish" },
  { code: "fi", label: "Finnish" },
  { code: "pl", label: "Polish" },
  { code: "uk", label: "Ukrainian" },
  { code: "cs", label: "Czech" },
  { code: "ro", label: "Romanian" },
  { code: "hu", label: "Hungarian" },
  { code: "el", label: "Greek" },
  { code: "sw", label: "Swahili" },
  { code: "af", label: "Afrikaans" },
  { code: "am", label: "Amharic" },
  { code: "ne", label: "Nepali" },
  { code: "si", label: "Sinhala" },
  { code: "my", label: "Burmese" },
  { code: "km", label: "Khmer" },
  { code: "lo", label: "Lao" },
  { code: "fil", label: "Filipino" },
  { code: "ha", label: "Hausa" },
  { code: "yo", label: "Yoruba" },
] as const;
export type CompanyProfileLanguageCode = (typeof COMPANY_PROFILE_LANGUAGE_OPTIONS)[number]["code"];

export const COMPANY_PROFILE_CURRENCY_OPTIONS = [
  { code: "USD", label: "US Dollar" },
  { code: "INR", label: "Indian Rupee" },
  { code: "EUR", label: "Euro" },
  { code: "GBP", label: "British Pound" },
  { code: "AED", label: "UAE Dirham" },
  { code: "SGD", label: "Singapore Dollar" },
  { code: "JPY", label: "Japanese Yen" },
  { code: "AUD", label: "Australian Dollar" },
  { code: "CAD", label: "Canadian Dollar" },
  { code: "CHF", label: "Swiss Franc" },
  { code: "CNY", label: "Chinese Yuan" },
  { code: "HKD", label: "Hong Kong Dollar" },
  { code: "NZD", label: "New Zealand Dollar" },
  { code: "ZAR", label: "South African Rand" },
  { code: "BRL", label: "Brazilian Real" },
  { code: "MXN", label: "Mexican Peso" },
  { code: "RUB", label: "Russian Ruble" },
  { code: "KRW", label: "South Korean Won" },
  { code: "IDR", label: "Indonesian Rupiah" },
  { code: "THB", label: "Thai Baht" },
  { code: "MYR", label: "Malaysian Ringgit" },
  { code: "PHP", label: "Philippine Peso" },
  { code: "SAR", label: "Saudi Riyal" },
  { code: "QAR", label: "Qatari Riyal" },
  { code: "KWD", label: "Kuwaiti Dinar" },
  { code: "BDT", label: "Bangladeshi Taka" },
  { code: "PKR", label: "Pakistani Rupee" },
  { code: "NPR", label: "Nepalese Rupee" },
  { code: "LKR", label: "Sri Lankan Rupee" },
] as const;
export type CompanyProfileCurrencyCode = (typeof COMPANY_PROFILE_CURRENCY_OPTIONS)[number]["code"];

export const COMPANY_PROFILE_TIMEZONE_OPTIONS = [
  "UTC",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Hong_Kong",
  "Asia/Seoul",
  "Asia/Bangkok",
  "Asia/Jakarta",
  "Asia/Kathmandu",
  "Asia/Karachi",
  "Asia/Dhaka",
  "Asia/Riyadh",
  "Asia/Qatar",
  "Asia/Kuwait",
  "Asia/Jerusalem",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Madrid",
  "Europe/Rome",
  "Europe/Amsterdam",
  "Europe/Zurich",
  "Europe/Stockholm",
  "Europe/Warsaw",
  "Europe/Athens",
  "Europe/Istanbul",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "America/Toronto",
  "America/Vancouver",
  "America/Mexico_City",
  "America/Sao_Paulo",
  "America/Bogota",
  "America/Lima",
  "America/Santiago",
  "Africa/Cairo",
  "Africa/Johannesburg",
  "Africa/Nairobi",
  "Africa/Lagos",
  "Australia/Sydney",
  "Australia/Melbourne",
  "Australia/Perth",
  "Pacific/Auckland",
] as const;
export type CompanyProfileTimezone = (typeof COMPANY_PROFILE_TIMEZONE_OPTIONS)[number];

export interface CompanyProfile {
  companyId: string;
  registeredSince: string | null;
  businessCategory: string | null;
  businessSubcategory: string | null;
  defaultLanguage: CompanyProfileLanguageCode | null;
  defaultCurrency: CompanyProfileCurrencyCode | null;
  website: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  contactAddress: string | null;
  timezone: CompanyProfileTimezone | null;
  businessSummary: string | null;
  targetCustomers: string | null;
  brandVoice: string | null;
  operatingNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyMemoryItem {
  id: string;
  companyId: string;
  memoryType: CompanyMemoryType;
  kind: CompanyMemoryKind;
  status: CompanyMemoryStatus;
  scopeType: CompanyMemoryScopeType;
  scopeId: string | null;
  title: string;
  body: string;
  summary: string | null;
  tags: string[];
  sourceType: CompanyMemorySourceType;
  sourceId: string | null;
  createdByUserId: string | null;
  createdByAgentId: string | null;
  approvedByUserId: string | null;
  approvedByAgentId: string | null;
  approvedAt: string | null;
  confidence: number;
  importance: number;
  expiresAt: string | null;
  lastUsedAt: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyMemoryListResponse {
  items: CompanyMemoryItem[];
  total: number;
}

export interface CompanyMemoryRecallInput {
  query?: string;
  agentId?: string | null;
  agentRole?: string | null;
  issueId?: string | null;
  projectId?: string | null;
  limit?: number;
}

export interface CompanyMemoryRecallItem extends CompanyMemoryItem {
  recallScore: number;
}

export interface CompanyMemoryRecallResponse {
  items: CompanyMemoryRecallItem[];
  profile: CompanyProfile | null;
}
