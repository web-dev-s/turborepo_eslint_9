const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const nodeExternals = require('webpack-node-externals');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const { RunScriptWebpackPlugin } = require('run-script-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: ['webpack/hot/poll?100', './src/main.ts'],
  target: 'node',
  externals: [
    nodeExternals({
      allowlist: [
        'webpack/hot/poll?100',
        'node_modules/@nestjs',
        'node_modules/swagger-ui-dist',
      ],
      sqlite3: 'commonjs2 sqlite3',
      ...(() => {
        var nodeModules = {};
        fs.readdirSync('node_modules')
          .filter(function (x) {
            return ['.bin'].indexOf(x) === -1;
          })
          .forEach(function (mod) {
            nodeModules[mod] = 'commonjs ' + mod;
          });
        return nodeModules;
      })(),
    }),
  ],
  module: {
    rules: [
      {
        test: /.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  mode: 'production',
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.json'],
    alias: {
      '@UI': path.resolve(__dirname, '../vite.ui/src'),
      '@Shared': path.resolve(__dirname, '../shared/common/src'),
      '@': path.resolve(__dirname, 'src'),
    },
    mainFields: ['main'],
    plugins: [new TsconfigPathsPlugin({ configFile: 'tsconfig.json' })],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.IgnorePlugin({
      checkResource(resource) {
        const lazyImports = [
          '@nestjs/microservices',
          '@nestjs/microservices/microservices-module',
          '@nestjs/platform-express',
          '@nestjs/websockets/socket-module',
          'amqp-connection-manager',
          'amqplib',
          'better-sqlite3',
          'cache-manager',
          'cache-manager/package.json',
          'class-transformer/storage',
          'hbs',
          'ioredis',
          'kafkajs',
          'mqtt',
          'mysql',
          'mysql2',
          'nats',
          'oracledb',
          'pg',
          'pg-query-stream',
          'sqlite3',
        ];
        if (!lazyImports.includes(resource)) {
          return false;
        }
        try {
          require.resolve(resource, { paths: [process.cwd()] });
        } catch (err) {
          return true;
        }
        return false;
      },
    }),
    new RunScriptWebpackPlugin({ name: 'main.js', autoRestart: false }),
    new CopyWebpackPlugin({ patterns: copyWebpackPlugin_pattern_swagger_ui() }),
    new ForkTsCheckerWebpackPlugin(),
  ],
  optimization: {
    // Minimization doesn't work with @Module annotation
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          keep_classnames: true,
          keep_fnames: true,
        },
      }),
    ],
    nodeEnv: false,
  },
  output: {
    filename: '[name].js',
    path: path.join(__dirname, 'dist'),
  },
};

function copyWebpackPlugin_pattern_swagger_ui(standalone) {
  return [
    'swagger-ui.css',
    'swagger-ui-bundle.js',
    'swagger-ui-standalone-preset.js',
    'favicon-16x16.png',
    'favicon-32x32.png',
  ].map((fileName) => ({
    // Look inside local node_modules if running as standalone package : const standalone = './';
    // Look inside root node_modules if running as monorepo workspace package:  const monorepo = '../';
    from: `${standalone ? './' : '../'}node_modules/swagger-ui-dist/${fileName}`,
    noErrorOnMissing: true,
  }));
}
