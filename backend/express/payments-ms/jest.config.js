// jest.config.js
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src/tests"],
  moduleFileExtensions: ["ts", "js", "json"],
  testMatch: ["**/*.test.ts"],
  clearMocks: true,
  verbose: true,
};
