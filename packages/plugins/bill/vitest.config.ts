import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "@kesarcloud/plugin-bill",
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
