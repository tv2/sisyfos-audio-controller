const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

// Any directories you will be adding code/files into, need to be added to this array so webpack will pick them up
const defaultInclude = [
  path.resolve(__dirname, 'src'),
  path.resolve(__dirname, 'server')
]

module.exports = {
  module: {
    rules: [
      {
        test:/\.css$/,
        use:['style-loader', 'css-loader']
      },
      {
          test: /\.(tsx?|ts)$/,
          use: [{ loader: 'babel-loader' }],
          include: defaultInclude
      },
      {
        test: /\.(jpe?g|png|gif)$/,
        use: [{ loader: 'file-loader?name=img/[name]__[hash:base64:5].[ext]' }],
        include: defaultInclude
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        use: [{ loader: 'file-loader?name=font/[name]__[hash:base64:5].[ext]' }],
        include: defaultInclude
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    // NB: Can also be "window", etc.
    libraryTarget: "var"
  },
  target: 'web',
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.ejs',
      inject: true
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  ],
  stats: {
    colors: true,
    children: false,
    chunks: false,
    modules: false
  },
  externals: {
    fs: require("fs"),
  }
}
