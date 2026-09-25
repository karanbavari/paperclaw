import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "@kesarcloud/plugin-playwright-mcp",
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
