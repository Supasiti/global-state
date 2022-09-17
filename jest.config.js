/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
  moduleDirectories: ['node_modules', 'src'],
  testRegex: 'test.(js|ts|tsx)$',
  moduleFileExtensions: ['ts', 'js', 'tsx', 'json', 'node'],
};
