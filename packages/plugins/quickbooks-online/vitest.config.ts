import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "@kesarcloud/plugin-quickbooks-online",
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
