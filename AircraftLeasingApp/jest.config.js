module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^react-native-linear-gradient$': '<rootDir>/__mocks__/linearGradientMock.js',
  },
};
