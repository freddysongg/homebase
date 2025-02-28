export default {
  testEnvironment: "node",
  moduleFileExtensions: ["js", "json"],
  moduleDirectories: ["node_modules", "src"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@models/(.*)$": "<rootDir>/src/models/$1",
    "^@controllers/(.*)$": "<rootDir>/src/controllers/$1",
    "^@middleware/(.*)$": "<rootDir>/src/middleware/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@config/(.*)$": "<rootDir>/src/config/$1",
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  testMatch: ["**/src/tests/**/*.test.js"],
  transform: {},
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup.js"],
};
