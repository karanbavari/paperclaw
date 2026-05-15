import { describe, expect, it } from "vitest";
import { updateCompanyProfileSchema } from "./company-memory.js";

describe("updateCompanyProfileSchema", () => {
  it("normalizes localized profile dates from the memory form", () => {
    const parsed = updateCompanyProfileSchema.parse({
      registeredSince: "25/02/2025",
      businessCategory: " IT company ",
      defaultLanguage: "hi",
      defaultCurrency: "INR",
      timezone: "Asia/Kolkata",
    });

    expect(parsed.registeredSince).toBe("2025-02-25");
    expect(parsed.businessCategory).toBe("IT company");
  });

  it("keeps empty profile date fields nullable", () => {
    expect(updateCompanyProfileSchema.parse({ registeredSince: "" }).registeredSince).toBeNull();
  });
});
