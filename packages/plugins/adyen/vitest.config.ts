import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "@kesarcloud/plugin-adyen",
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
