/* global __dirname:false */

module.exports = {
    entry: './src/main.js',
    devtool: 'cheap-module-eval-source-map',
    target: 'web',
    output: {
      path: __dirname,
      filename: 'clustergrammer.js',
      libraryTarget: 'var',
      library: 'Clustergrammer'
    },
    externals: {
      'jQuery': 'jQuery',
      'lodash': '_',
      'underscore': '_',
      'd3': 'd3'
    },
    module: {
        loaders: [
            {
              test: /\.js$/,
              loader: 'babel'
            }
        ]
    }
};
