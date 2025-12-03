import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    include: ["**/tests/**/*.ts", "**/*.test.ts"],
    snapshotSerializers: ["jest-snapshot-serializer-raw"],
    coverage: {
      enabled: !!process.env.CI,
      reporter: ["lcov", "text"],
      include: ["src/**/*.ts"],
      exclude: ["src/index.ts", "src/helpers.ts", "src/types.ts"],
      // FIXME
      thresholds: {
        branches: 15,
        functions: 15,
        lines: 15,
        statements: 15,
      },
    },
  },
});
