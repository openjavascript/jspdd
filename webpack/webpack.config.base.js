'use strict';

module.exports = {
    entry: {
        'jspdd': ['./src/jspdd.js']
        , 'demo-case1': './src/demo-case1.js'
    }
    , output: {
        filename: '[name].js'
        , path: './dist'
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
