module.exports = {
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "js", "json"],
  testMatch: ["**/tests/**/*.ts", "**/*.test.ts"],
  transform: { "\\.ts$": "ts-jest" },
  snapshotSerializers: ['jest-snapshot-serializer-raw'],
  coverageReporters: ["lcov", "text-summary"],
  collectCoverage: !!process.env.CI,
  collectCoverageFrom: ["src/**/*.ts"],
  coveragePathIgnorePatterns: [
    "src/index.ts",
    "src/helpers.ts",
    "src/types.ts"
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      // TODO: 100
      functions: 98,
      lines: 100,
      statements: 100
    }
  }
};
