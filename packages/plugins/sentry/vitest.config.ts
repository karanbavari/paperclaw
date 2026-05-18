import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "@kesarcloud/plugin-sentry",
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
