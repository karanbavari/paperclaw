import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "@kesarcloud/plugin-cloudflare",
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
