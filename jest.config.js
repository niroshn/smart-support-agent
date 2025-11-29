/** @type {import('jest').Config} */
export default {
  // Use ts-jest preset for TypeScript
  preset: 'ts-jest',

  // Use jsdom environment for React components
  testEnvironment: 'jsdom',

  // Module name mapper for CSS and asset imports
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg|webp)$': '<rootDir>/__mocks__/fileMock.js',
    '^react-markdown$': '<rootDir>/__mocks__/reactMarkdown.js',
  },

  // Handle ES modules in node_modules
  transformIgnorePatterns: [
    'node_modules/(?!(react-markdown|vfile|unist-.*|unified|bail|is-plain-obj|trough|remark-.*|mdast-util-.*|micromark.*|decode-named-character-reference|character-entities)/)',
  ],

  // Setup files to run before tests
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],

  // Test match patterns
  testMatch: [
    '**/__tests__/**/*.{ts,tsx}',
    '**/*.{spec,test}.{ts,tsx}',
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
  ],

  // Transform files
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
        },
        diagnostics: {
          ignoreCodes: [1343],
        },
        astTransformers: {
          before: [
            {
              path: 'node_modules/ts-jest-mock-import-meta',
              options: { metaObjectReplacement: { env: { VITE_API_URL: 'http://localhost:3001' } } },
            },
          ],
        },
      },
    ],
  },

  // Globals for import.meta
  globals: {
    'import.meta': {
      env: {
        VITE_API_URL: 'http://localhost:3001',
      },
    },
  },

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Ignore patterns
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/build/'],

  // Coverage thresholds (optional)
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },

  // Verbose output
  verbose: true,
};
