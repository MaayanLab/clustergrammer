var webpack = require('webpack');
var BrowserSyncPlugin = require('browser-sync-webpack-plugin');

module.exports = [
  {
    mode: 'development',
    entry: './src/main.js',
    target: 'web',
    devtool: 'cheap-source-map',
    output: {
      path: __dirname,
      filename: 'clustergrammer.js',
      libraryTarget: 'var',
      library: 'Clustergrammer'
    },
    externals: {
      jquery: 'jquery',
      d3: 'd3'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      ]
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
    ]
  },
  {
    mode: 'production',
    entry: './src/main.js',
    target: 'web',
    devtool: 'cheap-source-map',
    output: {
      path: __dirname,
      filename: 'clustergrammer.cjs.js',
      libraryTarget: 'commonjs2',
      library: 'Clustergrammer'
    },
    performance: {
      hints: false
    },
    externals: {
      jquery: 'jquery',
      d3: 'd3'
    },
    optimization: {
      minimize: false
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      ]
    }
  },
  {
    mode: 'production',
    entry: './src/main.js',
    target: 'web',
    devtool: 'cheap-source-map',
    output: {
      path: __dirname,
      filename: 'clustergrammer.min.js',
      libraryTarget: 'var',
      library: 'Clustergrammer'
    },
    externals: {
      jquery: 'jquery',
      d3: 'd3'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      ]
    },
    performance: {
      hints: false
    }
  }
];
