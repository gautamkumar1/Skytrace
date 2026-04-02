const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const config = getDefaultConfig(__dirname);

// Add web support via Expo
config.resolver = {
  ...config.resolver,
  sourceExts: [...(config.resolver?.sourceExts || []), 'mjs'],
};

module.exports = config;
