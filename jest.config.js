const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jest-environment-jsdom",

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/.next/",
    "<rootDir>/tests/e2e/",
  ],

  testMatch: [
    "<rootDir>/tests/**/*.test.{ts,tsx}",
    "<rootDir>/**/__tests__/**/*.{ts,tsx}",
  ],

  collectCoverageFrom: [
    "middleware.ts",
    "src/lib/**/*.{ts,tsx}",
    "src/utils/**/*.{ts,tsx}",
    "src/hooks/**/*.{ts,tsx}",
    "src/services/**/*.{ts,tsx}",
    "src/actions/**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
  ],

  clearMocks: true,
};

// ============================================================================
// Sobrescreve transformIgnorePatterns para permitir transformação de pacotes ESM
// ============================================================================
// next/jest define um transformIgnorePatterns padrão que ignora node_modules.
// Sobrescrevemos para incluir pacotes ESM que o teu projeto usa.

module.exports = async () => {
  const config = await createJestConfig(customJestConfig)();

  // Lista de pacotes ESM que precisam ser transformados pelo Jest
  const esmModules = [
    "nuqs",
    "jose",
    "@panva/hkdf",
    "preact",
    "preact-render-to-string",
    "uuid",
    // Adiciona outros aqui se forem necessários
  ].join("|");

  config.transformIgnorePatterns = [
    `node_modules/(?!.pnpm|${esmModules})`,
    `node_modules/.pnpm/(?!(${esmModules})@)`,
  ];

  return config;
};