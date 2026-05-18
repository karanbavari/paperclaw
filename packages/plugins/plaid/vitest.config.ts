import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "@kesarcloud/plugin-plaid",
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
