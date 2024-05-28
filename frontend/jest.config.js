module.exports = {
    testEnvironment: 'jsdom', // This is common for React projects
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['json', 'lcov', 'text', 'clover'],
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    setupFilesAfterEnv: ['./jest.setup.js'], // Make sure this file exists if you use it
    testMatch: [
      '**/__tests__/**/*.js?(x)',
      '**/?(*.)+(spec|test).js?(x)'
    ],
  };
  