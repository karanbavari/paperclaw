import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "@kesarcloud/plugin-figma",
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
