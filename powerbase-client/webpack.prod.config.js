/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const webpack = require('webpack');
const HtmlPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
require('dotenv').config();

module.exports = {
  mode: 'production',
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
        PUSHER_HOST: JSON.stringify(process.env.PUSHER_HOST),
        PUSHER_KEY: JSON.stringify(process.env.PUSHER_KEY),
        SENTRY_DSN: JSON.stringify(process.env.SENTRY_DSN),
        ENABLE_LISTENER: JSON.stringify(process.env.ENABLE_LISTENER),
        ENABLE_SENTRY: JSON.stringify(process.env.ENABLE_SENTRY),
      },
    }),
    new webpack.optimize.AggressiveMergingPlugin(),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin(),
      new CssMinimizerPlugin(),
    ],
    splitChunks: {
      chunks: 'all',
    },
  },
  devServer: {
    historyApiFallback: true,
    host: '0.0.0.0',
    port: process.env.PORT
      ? parseInt(process.env.PORT, 10)
      : 4000,
  },
};
