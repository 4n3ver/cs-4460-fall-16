"use strict";

const path = require("path");
const fs = require('fs');

let nodeModules = {};
fs.readdirSync('node_modules')
  .filter((x) => ['.bin'].indexOf(x) === -1)
  .forEach((mod) => nodeModules[mod] = 'commonjs ' + mod);

module.exports = [
    {
        name     : 'Client Build',
        entry    : {
            main: path.resolve(__dirname, "src/main.js"),
        },
        output   : {
            path    : path.join(__dirname, "build", "public"),
            filename: "js/[name].bundle.js"
        },
        target   : 'web',
        module   : {
            loaders: [
                {
                    test          : /\.js?$/,
                    exclude       : /(node_modules)/,
                    loader        : "babel",
                    cacheDirectory: true,
                    query         : {
                        presets: [
                            "es2015"
                        ]
                    }
                },
                {   // copy static (public) resources to build folder
                    test   : /\.(html|css|csv)$/,
                    exclude: /(node_modules)/,
                    loader :
                        `file-loader?name=[path][name].[ext]&context=${
                            path.resolve(__dirname, "public/")}`
                }
            ]
        },
        resolve  : {
            extensions: ['', '.js']
        },
        devServer: {
            historyApiFallback: true,
            inline            : true,
            colors            : true,
            progress          : true,
            open              : true,
            contentBase       : path.resolve(__dirname, "public/"),
            port              : 8080
        },
        devtool  : "source-map"
    }
];
