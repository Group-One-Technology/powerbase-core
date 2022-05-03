const path = require('path');
const webpack = require('webpack');
const HtmlPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
require('dotenv').config();

module.exports = {
  context: __dirname,
  entry: './src/index.jsx',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: '[name].js',
    publicPath: '/',
    clean: true,
  },
  resolve: {
    alias: {
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@lib': path.resolve(__dirname, 'src/lib'),
      '@public': path.resolve(__dirname, 'src/public'),
      '@models': path.resolve(__dirname, 'src/models'),
      '@css': path.resolve(__dirname, 'src/css'),
    },
    extensions: ['.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          'babel-loader',
          {
            loader: 'eslint-loader',
            options: {
              quiet: true,
            },
          },
        ],
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
  plugins: [
    new HtmlPlugin({
      filename: 'index.html',
      template: './src/index.html',
    }),
    new CopyPlugin({
      patterns: [
        { from: path.resolve(__dirname, 'src', 'public'), to: path.resolve(__dirname, 'public', 'public') },
      ],
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        API: JSON.stringify(process.env.API),
        API_ENCRYPTION_KEY: JSON.stringify(process.env.API_ENCRYPTION_KEY),
        PUSHER_KEY: JSON.stringify(process.env.PUSHER_KEY),
        SENTRY_DSN: JSON.stringify(process.env.SENTRY_DSN),
        EDITMODE_PROJECT_ID: JSON.stringify(process.env.EDITMODE_PROJECT_ID),
        SAMPLE_DATABASE_ID: JSON.stringify(process.env.SAMPLE_DATABASE_ID),
        ENABLE_LISTENER: JSON.stringify(process.env.ENABLE_LISTENER),
        ENABLE_SENTRY: JSON.stringify(process.env.ENABLE_SENTRY),
      },
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
  devServer: {
    historyApiFallback: true,
    port: 4000,
    compress: true,
    hot: true,
  },
};
