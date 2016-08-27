"use strict";

const path = require("path");

module.exports = {
    name     : 'Client Build',
    entry    : {
        main: path.resolve(__dirname, "src/main.js"),
    },
    output   : {
        path      : path.join(__dirname, "public", "js"),
        filename  : "[name].bundle.js",
        publicPath: "/js/"
    },
    target   : 'web',
    devServer: {
        inline     : true,
        colors     : true,
        progress   : true,
        open       : true,
        contentBase: path.resolve(__dirname, "public/"),
        port       : 7777
    },
    module   : {
        loaders: [
            {
                test          : /\.js$/,
                exclude       : /(node_modules)/,
                loader        : "babel",
                cacheDirectory: true,
                query         : {
                    presets: [
                        "es2015"
                    ]
                }
            }
        ]
    }
};
