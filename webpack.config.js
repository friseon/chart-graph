const path = require('path');
const libraryName = 'chart';
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { HotModuleReplacementPlugin } = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const optimization = {
    minimize: false
};

const OUTPUT_PATH = './dist';
const SOURCE_PATH = './src';
module.exports = (env, options) => {
    const isProd = options.mode === 'production';

    const plugins = [
        new HtmlWebpackPlugin({
            env: options.mode,
            inject: false,
            hash: isProd,
            template: './src/index.html',
            filename: 'index.html',
            minify: {
                removeComments: isProd,
                collapseWhitespace: isProd
            }
        })
    ];

    if(!isProd) {
        plugins.unshift(new HotModuleReplacementPlugin());
    }

    if (isProd) {
        optimization.minimize = true;
        plugins.unshift(new MiniCssExtractPlugin({
            filename: "[name].css",
            library: libraryName
        }));
    }

    return {
        entry: {
            chart: path.join(__dirname, SOURCE_PATH, 'index.js')
        },

        plugins,

        optimization: optimization,

        output: {
            path: path.join(__dirname, OUTPUT_PATH),
            filename: "[name].js",
            library: libraryName
        },

        module: {
            rules: [
                {
                    test: /\.js$/,
                    loader: 'babel-loader',
                    exclude: /node_modules/
                },
                {
                    test: /\.scss$/,
                    use: [
                        isProd ? MiniCssExtractPlugin.loader : {
                            loader: "style-loader"
                        },
                        {
                            loader: "css-loader",
                        },
                        {
                            loader: "sass-loader"
                        }
                    ]
                }
            ]
        },

        devtool: isProd ? "" : "inline-source-map",

        resolve: {
            extensions: ['.js']
        },

        devServer:{
            stats: 'errors-only',
            host: 'localhost',
            port: 8080,
            contentBase: path.join(__dirname, OUTPUT_PATH),
            historyApiFallback: true,
            publicPath: '/',
        }
    };
};