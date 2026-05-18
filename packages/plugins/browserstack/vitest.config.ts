import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "@kesarcloud/plugin-browserstack",
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
