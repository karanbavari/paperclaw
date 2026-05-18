import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "@kesarcloud/plugin-freshbooks",
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
