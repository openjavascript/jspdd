'use strict';

module.exports = {
  entry: './src/index.js',
  output: {
    library: 'jspdd',
    libraryTarget: 'umd'
  },
  resolve: {
    extensions: ['', '.js']
  },
  module: {
    loaders: [
      { test: /\.js$/, loaders: ['babel-loader'], exclude: /node_modules/ }
    ]
  }
};
