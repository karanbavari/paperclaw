import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "@kesarcloud/plugin-render",
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
