const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  projects: [
    {
      displayName: 'sleepy-react-web',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      moduleDirectories: ["node_modules", "<rootDir>"],
      moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
      testMatch: ['**/web/*.test.ts?(x)']
    },
    {
      displayName: 'sleepy-react-node',
      preset: 'ts-jest',
      testEnvironment: 'node',
      moduleDirectories: ["node_modules", "<rootDir>"],
      moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
      testMatch: ['**/node/*.test.ts?(x)']
    }
  ],
};