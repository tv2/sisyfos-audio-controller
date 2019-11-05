module.exports = {
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig-test.json',
      babelConfig: '.babelrc'
    }
  },
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    "dist",
    "integrationTests"
  ],
  moduleFileExtensions: [
    'js',
    'ts'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testMatch: [
    '**/__tests__/**/*.spec.(ts|js)',
  ],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
  coverageDirectory: './coverage/',
  collectCoverage: true,
}
