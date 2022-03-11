const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

// Any directories you will be adding code/files into, need to be added to this array so webpack will pick them up
const defaultInclude = [
    path.resolve(__dirname, '../client'),
    path.resolve(__dirname, '../shared'),
]

module.exports = {
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                options: {
                    configFile: 'tsconfig.json',
                },
            },
            {
                test: /\.(jpe?g|png|gif)$/,
                use: [
                    {
                        loader: 'file-loader?name=img/[name]__[hash:base64:5].[ext]',
                    },
                ],
                include: defaultInclude,
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2)$/,
                use: [
                    {
                        loader: 'file-loader?name=font/[name]__[hash:base64:5].[ext]',
                    },
                ],
                include: defaultInclude,
            },
        ],
    },
    entry: '.',
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    target: 'web',
    output: {
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.ejs',
            inject: true,
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
        }),
    ],
    stats: {
        colors: true,
        children: false,
        chunks: false,
        modules: false,
    },
}
