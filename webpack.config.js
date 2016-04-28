/* global __dirname:false */

var DEBUG = process.argv.indexOf('-p') === -1;

module.exports = {
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
      'lodash': '_',
      'underscore': '_',
      'd3': 'd3'
    },
    module: {
        loaders: [
            {
              test: /\.js$/,
              loader: 'babel',
              query: {
                presets: ['es2015']
              }
            }
        ]
    }
};
