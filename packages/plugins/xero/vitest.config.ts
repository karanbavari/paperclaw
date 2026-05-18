import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "@kesarcloud/plugin-xero",
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
