module.exports = {
    entry: './src/main.js',
    output: {
      path: __dirname,
      filename: 'clustergrammer.js',
    },
    module: {
        loaders: [
            { test: /\.js$/, loader: 'babel' }
        ]
    }
};
