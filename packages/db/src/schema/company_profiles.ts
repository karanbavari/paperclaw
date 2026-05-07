import { date, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { companies } from "./companies.js";

export const companyProfiles = pgTable("company_profiles", {
  companyId: uuid("company_id").primaryKey().references(() => companies.id, { onDelete: "cascade" }),
  registeredSince: date("registered_since"),
  businessCategory: text("business_category"),
  defaultLanguage: text("default_language"),
  defaultCurrency: text("default_currency"),
  website: text("website"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  contactAddress: text("contact_address"),
  timezone: text("timezone"),
  businessSummary: text("business_summary"),
  targetCustomers: text("target_customers"),
  brandVoice: text("brand_voice"),
  operatingNotes: text("operating_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
