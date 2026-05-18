import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "@kesarcloud/plugin-paypal",
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
