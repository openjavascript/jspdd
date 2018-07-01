'use strict';

module.exports = {
    entry: {
        'jspdd': ['./src/jspdd.js']
    }
    , output: {
        filename: '[name].js'
        , path: './dist'
    },
    resolve: {
        extensions: ['', '.js']
        , alias: {
            'jspdd-basedata': '../../jspdd-basedata/dist/basedata.js'
        }

    },
    module: {
        loaders: [
            { test: /\.js$/, loaders: ['babel-loader'], exclude: /node_modules/ }
        ]
    }
};
