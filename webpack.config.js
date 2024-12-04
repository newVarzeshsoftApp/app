const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');

const appDirectory = path.resolve(__dirname);
const {presets} = require(`${appDirectory}/babel.config.js`);

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
      limit: 8192, // Inline images smaller than 8kb
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
      filename: '[name].[contenthash].js', // Cache busting
      clean: true, // Automatically clean the output directory
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
      new webpack.HotModuleReplacementPlugin(),
      new Dotenv({
        path: path.resolve(
          __dirname,
          isProduction ? '.env.production' : '.env.development',
        ),
        safe: false,
      }),
      new webpack.DefinePlugin({
        __DEV__: JSON.stringify(!isProduction),
      }),
      new webpack.EnvironmentPlugin({JEST_WORKER_ID: null}),
      isProduction && new CompressionPlugin(), // Gzip compression for assets
      isProduction &&
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: path.join(__dirname, 'bundle-report.html'),
        }),
    ].filter(Boolean), // Remove false plugins
    optimization: {
      splitChunks: {
        chunks: 'all', // Splits all chunks (e.g., node_modules, app code)
        minSize: 20000, // Minimum size in bytes before splitting
        maxSize: 244000, // Maximum chunk size to align with Webpack recommendations
      },

      minimize: isProduction, // Minify only in production
      minimizer: [
        new TerserPlugin({
          parallel: true, // Use multi-process for minification
          terserOptions: {
            compress: {
              drop_console: true, // Remove console.logs in production
            },
          },
        }),
      ],
    },
    devServer: {
      static: path.join(__dirname, 'public'),
      compress: true,
      hot: true,
      port: 3000,
      historyApiFallback: true,
    },
    performance: {
      hints: isProduction ? 'warning' : false,
      maxEntrypointSize: 512000, // Customize limits
      maxAssetSize: 512000,
    },
  };
};
