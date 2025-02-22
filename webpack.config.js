const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const {sentryWebpackPlugin} = require('@sentry/webpack-plugin');

const appDirectory = path.resolve(__dirname);
const {presets} = require(`${appDirectory}/babel.config.js`);
const compileNodeModules = [
  'react-native', // Add every react-native package that needs compiling
].map(moduleName => path.resolve(appDirectory, `node_modules/${moduleName}`));

const babelLoaderConfiguration = {
  test: /\.(js|jsx|ts|tsx)$/,
  include: [
    path.resolve(__dirname, 'index.web.js'),
    path.resolve(__dirname, 'App.tsx'),
    path.resolve(__dirname, 'src'),
    path.resolve(__dirname, 'node_modules/react-native-css-interop'),
    path.resolve(__dirname, 'node_modules/@react-native'),
    path.resolve(__dirname, 'node_modules/react-native-toast-message'),
    path.resolve(__dirname, 'node_modules/react-native-svg'),
    path.resolve(__dirname, 'node_modules/react-native-progress'),
    path.resolve(__dirname, 'node_modules/react-native-collapsible'),
    ...compileNodeModules,
  ],
  use: {
    loader: 'babel-loader',
    options: {
      cacheDirectory: true,
      presets,
      plugins: ['react-native-web', 'react-native-reanimated/plugin'],
    },
  },
};

const cssLoaderConfiguration = {
  test: /\.css$/,
  use: [
    'style-loader',
    {
      loader: 'css-loader',
      options: {
        importLoaders: 1,
        modules: {
          auto: true,
        },
      },
    },
    'postcss-loader',
  ],
};

const svgLoaderConfiguration = {
  test: /\.svg$/,
  use: [
    {
      loader: '@svgr/webpack',
      options: {
        svgo: false,
      },
    },
  ],
};

const imageLoaderConfiguration = {
  test: /\.(gif|jpe?g|png)$/,
  use: {
    loader: 'url-loader',
    options: {
      limit: 8192,
      name: 'assets/images/[name].[hash].[ext]',
      esModule: false,
    },
  },
};

const fontLoaderConfiguration = {
  test: /\.(ttf|woff|woff2|eot)$/,
  type: 'asset/resource',
  generator: {
    filename: 'assets/font/[name][hash][ext]',
  },
};

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    mode: isProduction ? 'production' : 'development',
    entry: {
      app: path.join(__dirname, 'index.web.js'),
    },
    output: {
      path: path.resolve(appDirectory, 'dist'),
      publicPath: '/',
      filename: '[name].[contenthash].js',
      clean: true,
    },
    resolve: {
      extensions: ['.web.tsx', '.web.ts', '.tsx', '.ts', '.web.js', '.js'],
      alias: {
        'react-native$': 'react-native-web',
        'react-native-linear-gradient': 'react-native-web-linear-gradient',
        '@react-native-community/blur': path.resolve(
          __dirname,
          'src/mocks/BlurViewMock.js',
        ),
      },
    },
    cache: {
      type: 'filesystem',
      cacheDirectory: path.resolve(__dirname, '.webpack_cache'),
    },
    devtool: isProduction ? 'source-map' : 'source-map',
    module: {
      rules: [
        babelLoaderConfiguration,
        cssLoaderConfiguration,
        fontLoaderConfiguration,
        imageLoaderConfiguration,
        svgLoaderConfiguration,
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.join(__dirname, '/public/index.html'),
      }),
      !isProduction && new ReactRefreshWebpackPlugin(), // React Fast Refresh for development
      new Dotenv({
        path: path.resolve(
          __dirname,
          isProduction ? '.env.production' : '.env.development',
        ),
      }),
      new webpack.DefinePlugin({
        __DEV__: JSON.stringify(!isProduction),
      }),
      isProduction && new CompressionPlugin(), // Gzip compression in production
      isProduction &&
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        }),
      new CopyWebpackPlugin({
        patterns: [
          {from: 'public/manifest.json', to: 'manifest.json'},
          {from: 'public/service-worker.js', to: 'service-worker.js'},
        ],
      }),
      isProduction &&
        sentryWebpackPlugin({
          authToken: process.env.SENTRY_AUTH_TOKEN,
          org: 'techleafsolution',
          project: 'varzeshsoft-front-web',
        }),
    ].filter(Boolean), // Remove falsy plugins
    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          parallel: true, // Use multiple processes for minification
        }),
      ],
      splitChunks: {
        chunks: 'all', // Split vendor and app code
      },
    },
    // devServer: {
    //   static: {
    //     directory: path.join(__dirname, 'public'),
    //     watch: false,
    //   },
    //   compress: true,
    //   hot: true, // Enable HMR
    //   port: 3000,
    //   historyApiFallback: true, // Handle React Router
    // },

    devServer: {
      static: {
        directory: path.join(__dirname, 'public'),
        watch: false,
      },
      compress: true,
      hot: true, // Enable HMR      port: 3000,
      allowedHosts: 'all',
      host: '0.0.0.0',
      historyApiFallback: true, // Handle React Router
    },

    performance: {
      hints: false,
      maxEntrypointSize: 512000, // Performance budget
      maxAssetSize: 512000,
    },
  };
};
