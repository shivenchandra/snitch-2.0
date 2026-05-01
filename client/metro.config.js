const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Fix for Metro module resolution crash on EAS build servers (Linux)
// with react-native-reanimated 4.x
config.resolver.unstable_enablePackageExports = false;

module.exports = config;