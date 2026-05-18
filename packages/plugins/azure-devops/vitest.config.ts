import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "@kesarcloud/plugin-azure-devops",
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
