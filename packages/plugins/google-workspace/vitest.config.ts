import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "@kesarcloud/plugin-google-workspace",
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
