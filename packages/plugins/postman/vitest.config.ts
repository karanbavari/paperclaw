import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "@kesarcloud/plugin-postman",
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
