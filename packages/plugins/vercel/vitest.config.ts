import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "@kesarcloud/plugin-vercel",
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
