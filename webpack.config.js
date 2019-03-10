const path = require('path');
const libraryName = 'chart';
const env = process.env.WEBPACK_ENV;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { HotModuleReplacementPlugin } = require('webpack');

const optimization = {
    minimize: false
};

const OUTPUT_PATH = './dist';
const SOURCE_PATH = './src';

if (env === 'build') {
    optimization.minimize = true;
}

var config = {
    entry: {
        chart: path.join(__dirname, SOURCE_PATH, 'index.js')
    },

    plugins: [
        new HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
            env: 'build',
            inject: false,
            template: './src/index.html',
            filename: 'index.html'
        })
    ],

    optimization: optimization,

    output: {
        path: path.join(__dirname, OUTPUT_PATH),
        filename: "[name].js",
        library: libraryName,
        libraryTarget: 'umd',
        umdNamedDefine: true
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            }
        ]
    },

    devtool: "inline-source-map",

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

module.exports = config;