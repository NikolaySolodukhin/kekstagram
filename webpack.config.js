const PROD = process.env.NODE_ENV === 'production';
const DEV = process.env.NODE_ENV !== 'production';
const PUBLIC_URL = PROD ? require('./package.json').publicUrl : '';

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const WebpackChunkHash = require('webpack-chunk-hash');
const ManifestPlugin = require('webpack-manifest-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CssoWebpackPlugin = require('csso-webpack-plugin').default;
const CriticalPlugin = require('webpack-plugin-critical').CriticalPlugin;

module.exports = {
  context: path.resolve(__dirname, 'src'),
  entry: {
    app: 'js/main.js',
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: DEV ? 'js/[name].js' : 'js/[name].[chunkhash:8].js',
    chunkFilename: DEV
      ? 'js/[name].chunk.js'
      : 'js/[name].[chunkhash:8].chunk.js',
    publicPath: PUBLIC_URL,

    // Adds /* filename */ comments to generated require()s in the output
    pathinfo: DEV ? true : false,
  },
  resolve: {
    // Look for files in these directories
    modules: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, 'src'),
    ],
    plugins: [
      // Prevents users from importing files from outside of src/ (or node_modules/)
      new ModuleScopePlugin(path.resolve(__dirname, 'src')),
    ],
  },
  plugins: [
    // Define process.env variables
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development', // use 'development' unless process.env.NODE_ENV is defined
    }),
    // Define global variables
    new webpack.DefinePlugin({
      DEBUG: DEV,
      PUBLIC_URL: JSON.stringify(PUBLIC_URL),
    }),
    // Make some environment variables available in index.html.
    // The public URL is available as %PUBLIC_URL% in index.html, e.g.:
    // <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
    new InterpolateHtmlPlugin({ PUBLIC_URL }),
    // HTML pages
    new HtmlWebpackPlugin({
      template: 'index.html',
      filename: 'index.html',
      inject: false,
      minify: PROD
        ? {
            removeComments: true,
            collapseWhitespace: true,
            removeRedundantAttributes: true,
            useShortDoctype: true,
            removeEmptyAttributes: true,
            removeStyleLinkTypeAttributes: true,
            keepClosingSlash: true,
            minifyJS: true,
            minifyCSS: true,
            minifyURLs: true,
          }
        : false,
    }),
    // Extract vendor from app entry
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
    }),
    // DEV-only plugins
    ...(DEV
      ? [
          // Enable source maps
          new webpack.SourceMapDevToolPlugin(),
          // Add module names to factory functions so they appear in browser profiler
          new webpack.NamedModulesPlugin(),
          // This is necessary to emit hot updates
          new webpack.HotModuleReplacementPlugin(),
          // Watcher doesn't work well if you mistype casing in a path so we use
          // a plugin that prints an error when you attempt to do this
          new CaseSensitivePathsPlugin(),
          // If you require a missing module and then `npm install` it, you still have
          // to restart the development server for Webpack to discover it. This plugin
          // makes the discovery automatic so you don't have to restart
          new WatchMissingNodeModulesPlugin(
            path.resolve(__dirname, 'node_modules')
          ),
        ]
      : []),
    // PROD-only plugins
    ...(PROD
      ? [
          // Concatenate the scope of all modules (less wrapper functions)
          new webpack.optimize.ModuleConcatenationPlugin(),
          // Optimize hashes
          new webpack.HashedModuleIdsPlugin(),
          new WebpackChunkHash(),
          // Generate a manifest file which contains a mapping of all asset filenames
          // to their corresponding output file so that tools can pick it up
          new ManifestPlugin({ fileName: 'asset-manifest.json' }),
          // Minify the code.
          new webpack.optimize.UglifyJsPlugin({
            compress: {
              warnings: false,
              // Disabled because of an issue with Uglify breaking seemingly valid code:
              // https://github.com/facebookincubator/create-react-app/issues/2376
              // Pending further investigation:
              // https://github.com/mishoo/UglifyJS2/issues/2011
              comparisons: false,
            },
            output: {
              comments: false,
              // Turned on because emoji and regex is not minified properly using default
              // https://github.com/facebookincubator/create-react-app/issues/2488
              ascii_only: true,
            },
          }),
          // Copy statid dir to build
          new CopyWebpackPlugin([path.resolve(__dirname, 'static')]),
          // Extract css to separate file
          new ExtractTextPlugin('css/[name].[contenthash:8].css'),
          new CssoWebpackPlugin({
            debug: true,
            forceMediaMerge: true,
            structureMinimazation: true,
            comments: false,
          }),
          new CriticalPlugin({
            src: 'index.html',
            inline: true,
            minify: true,
            dest: 'index.html',
            ignore: ['@font-face', /url\(/],
          }),
        ]
      : []),
  ],
  module: {
    strictExportPresence: true,
    rules: [
      {
        // "oneOf" will traverse all following loaders until one will
        // match the requirements. When no loader matches it will fall
        // back to the "file" loader at the end of the loader list.
        // A missing `test` is equivalent to a match
        oneOf: [
          {
            test: /\.js$/i,
            // ansi-regex seems to be es6
            // and breaks older browsers
            exclude: /node_modules(?!\/ansi-regex)/,
            loader: 'babel-loader',
            options: { cacheDirectory: true },
          },
          {
            test: /\.css$/i,
            exclude: /node_modules/,
            use: DEV
              ? [
                  { loader: 'style-loader', options: { sourceMap: true } },
                  {
                    loader: 'css-loader',
                    options: { importLoaders: 1, sourceMap: true },
                  },
                  { loader: 'postcss-loader', options: { sourceMap: true } },
                ]
              : ExtractTextPlugin.extract({
                  fallback: 'style-loader',
                  use: [
                    {
                      loader: 'css-loader',
                      options: { importLoaders: 1 },
                    },
                    'postcss-loader',
                  ],
                }),
          },
          {
            test: /\.raw\.svg$/i,
            loader: 'raw-loader',
          },
          // DEFINE ALL OTHER LOADERS BEFORE THIS LINE, i.e. BEFORE FILE LOADER
          {
            // Exclude `js` files to keep "css" loader working as it injects
            // its runtime that would otherwise processed through "file" loader.
            // Also exclude `html` and `json` extensions so they get processed
            // by webpacks internal loaders
            exclude: /\.(js|html|json)$/i,
            loader: 'file-loader',
            options: { name: '[path][name].[hash:8].[ext]' },
          },
        ],
      },
    ],
  },
  devServer: {
    // Serve static dir (don't need copy plugin in development)
    contentBase: path.join(__dirname, 'static'),
    // ... and watche changes in it
    watchContentBase: false,
    // Enable gzip compression for everything served
    compress: true,
    // Enable hrm
    hot: true,
  },
  // Some libraries import Node modules but don't use them in the browser.
  // Tell Webpack to provide empty mocks for them so importing them works
  node: {
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty',
  },
  // Turn off performance hints during development because we don't do any
  // splitting or minification in interest of speed. These warnings become
  // cumbersome
  performance: PROD ? { hints: 'warning' } : false,
};
