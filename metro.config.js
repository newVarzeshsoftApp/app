const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const {withNativeWind} = require('nativewind/metro');
const {
  wrapWithReanimatedMetroConfig,
} = require('react-native-reanimated/metro-config');

const {withSentryConfig} = require('@sentry/react-native/metro');

module.exports = withSentryConfig(
  (async () => {
    // Get the default configuration
    const defaultConfig = await getDefaultConfig(__dirname);

    // Merge the default configuration with your custom settings
    const config = mergeConfig(defaultConfig, {
      transformer: {
        babelTransformerPath: require.resolve('react-native-svg-transformer'), // SVG transformer
      },
      resolver: {
        assetExts: defaultConfig.resolver.assetExts.filter(
          ext => ext !== 'svg',
        ), // Exclude SVG from asset extensions
        sourceExts: [...defaultConfig.resolver.sourceExts, 'svg'], // Add SVG to source extensions
      },
    });

    // Apply NativeWind configuration with your custom settings
    const nativeWindConfig = withNativeWind(config, {input: './global.css'});

    // Wrap the configuration with Reanimated's Metro config
    return wrapWithReanimatedMetroConfig(nativeWindConfig);
  })(),
);
