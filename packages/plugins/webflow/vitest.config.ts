import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "@kesarcloud/plugin-webflow",
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
