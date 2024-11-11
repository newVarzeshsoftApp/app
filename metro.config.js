const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const {withNativeWind} = require('nativewind/metro');

module.exports = (async () => {
  // Get the default configuration
  const defaultConfig = await getDefaultConfig(__dirname);

  // Merge the default configuration with custom settings
  const config = mergeConfig(defaultConfig, {
    transformer: {
      babelTransformerPath: require.resolve('react-native-svg-transformer'), // SVG transformer
    },
    resolver: {
      assetExts: defaultConfig.resolver.assetExts.filter(ext => ext !== 'svg'), // Exclude SVG from asset extensions
      sourceExts: [...defaultConfig.resolver.sourceExts, 'svg'], // Add SVG to source extensions
    },
  });

  // Apply NativeWind configuration with your custom settings
  return withNativeWind(config, {input: './global.css'});
})();
