const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const { RunScriptWebpackPlugin } = require('run-script-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = function (options, webpack) { 
  return {
    ...options,
    entry: ['webpack/hot/poll?100', options.entry],
    externals: [
      nodeExternals({
        allowlist: ['webpack/hot/poll?100', 'commonjs sqlite3'],
        sqlite3: 'commonjs sqlite3',
      }),
    ],
    plugins: [
      ...options.plugins,
      new webpack.HotModuleReplacementPlugin(),
      new webpack.WatchIgnorePlugin({
        paths: [/\.js$/, /\.d\.ts$/],
      }),
      new RunScriptWebpackPlugin({
        name: options.output.filename,
        autoRestart: false,
        nodeArgs: ['--inspect=0.0.0.0:9229'],
      }),
      new CopyWebpackPlugin({
        patterns: copyWebpackPlugin_pattern_swagger_ui(),
      }),
    ],
  };
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
