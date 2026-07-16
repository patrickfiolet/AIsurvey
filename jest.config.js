/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  // Pure-logic + web-API (Request/Response/Headers) tests run in Node, which
  // provides the WHATWG fetch globals that `next/server` relies on. UI/DOM
  // tests can opt into jsdom per-file via `@jest-environment jsdom` docblock.
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          esModuleInterop: true,
        },
      },
    ],
  },
  clearMocks: true,
}

module.exports = config
