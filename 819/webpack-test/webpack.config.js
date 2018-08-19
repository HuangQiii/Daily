const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'index.[hash:8].js',
    path: path.resolve(__dirname, './dist'),
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          use: ['css-loader']
        })
      },
      {
        test: /\.jpg$/,
        use: ['file-loader'],
      },
    ]
  },
  plugins: [
    new ExtractTextPlugin({
      filename: 'index.[hash:8].css',
    }),
    new HTMLWebpackPlugin({
      title: 'test-15085',
      template: './src/index.tplt.html',
      favicon: './favicon.ico',
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
  devServer: {
    hot: true,
    host: '127.0.0.1',
    contentBase: "./dist",    
    historyApiFallback: true,   
    inline: true,
    port:9090   
  },
};