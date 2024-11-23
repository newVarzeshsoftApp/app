const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack'); // Import dotenv-webpack

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
      name: '[name].[ext]',
      esModule: false,
    },
  },
};

const fontLoaderConfiguration = {
  test: /\.(ttf|woff|woff2|eot)$/,
  type: 'asset/resource',
  generator: {
    filename: 'assets/font/[name][ext]',
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
      filename: 'bundle.js',
    },
    resolve: {
      extensions: ['.web.tsx', '.web.ts', '.tsx', '.ts', '.web.js', '.js'],
      alias: {
        'react-native$': 'react-native-web',
        'react-native-linear-gradient': 'react-native-web-linear-gradient',
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
    ],
    devServer: {
      static: path.join(__dirname, 'public'),
      compress: true,
      hot: true,
      port: 3000,
      historyApiFallback: true,
    },
  };
};
