/* global __dirname:false */

var DEBUG = process.argv.indexOf('-p') === -1;
var webpack = require('webpack')
var BrowserSyncPlugin = require('browser-sync-webpack-plugin');

var loaders = [
    {
      test: /\.js$/,
      loader: 'babel',
      query: {
        presets: ['es2015']
      }
    },
    {
      test: require.resolve('jquery'),
      loader: 'expose?jQuery',
    },
    {
      test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
      loader: 'file-loader?name=/fonts/[name].[ext]'
    },
    {
      test: /\.(jpg|png|gif|svg)$/i,
      loader: 'file-loader?name=/images/[name].[ext]'
    },
];

module.exports = [
  {
      entry: './src/main.js',
      // devtool: DEBUG ? 'cheap-module-eval-source-map' : false,
      devtool: DEBUG ? 'cheap-module-source-map' : false,
      target: 'web',
      output: {
        path: __dirname,
        filename: 'clustergrammer.js',
        libraryTarget: 'var',
        library: 'Clustergrammer'
      },
      externals: {
        'jQuery': 'jQuery',
        // 'lodash': '_',
        // 'underscore': '_',
        'd3': 'd3'
      },
      module: {
          loaders: loaders,
      },
    plugins: [
      new BrowserSyncPlugin({
        // browse to http://localhost:3000/ during development,
        // ./public directory is being served
        host: 'localhost',
        port: 3000,
        server: {
          baseDir: './',
          index: 'index.html'
        }
      })
    ],
  },
  {
      entry: './src/main.js',
      // devtool: DEBUG ? 'cheap-module-eval-source-map' : false,
      devtool: DEBUG ? 'cheap-module-source-map' : false,
      target: 'web',
      output: {
        path: __dirname,
        filename: 'clustergrammer.node.js',
        libraryTarget: 'commonjs2',
        library: 'Clustergrammer'
      },
      externals: {
        'jQuery': 'jQuery',
        // 'lodash': '_',
        // 'underscore': '_',
        'd3': 'd3'
      },
      module: {
          loaders: loaders,
      }
  },
  {
      entry: './src/main.js',
      // devtool: DEBUG ? 'cheap-module-eval-source-map' : false,
      devtool: DEBUG ? 'cheap-module-source-map' : false,
      target: 'web',
      output: {
        path: __dirname,
        filename: 'clustergrammer.min.js',
        libraryTarget: 'var',
        library: 'Clustergrammer'
      },
      externals: {
        'jQuery': 'jQuery',
        // 'lodash': '_',
        // 'underscore': '_',
        'd3': 'd3'
      },
      plugins:[
        new webpack.optimize.UglifyJsPlugin({compress: { warnings: false }})
      ],
      module: {
          loaders: loaders,
      }
  },
  {
      entry: './src/main.js',
      // devtool: DEBUG ? 'cheap-module-eval-source-map' : false,
      devtool: DEBUG ? 'cheap-module-source-map' : false,
      target: 'web',
      output: {
        path: __dirname,
        filename: 'clustergrammer.node.min.js',
        libraryTarget: 'commonjs2',
        library: 'Clustergrammer'
      },
      externals: {
        'jQuery': 'jQuery',
        // 'lodash': '_',
        // 'underscore': '_',
        'd3': 'd3'
      },
      plugins:[
        new webpack.optimize.UglifyJsPlugin({compress: { warnings: false }})
      ],
      module: {
          loaders: loaders,
      }
  }
];
