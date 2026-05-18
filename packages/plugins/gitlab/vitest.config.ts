import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "@kesarcloud/plugin-gitlab",
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
