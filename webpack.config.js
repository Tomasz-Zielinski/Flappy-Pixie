const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: {
    app: './src/app.js'
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js'
  },
  module: {
    rules: [{
      test: /\.js?$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        presets: ["@babel/preset-env"]
      }
    },
    {
      test: /\.png$/,
      loader: 'url-loader?limit=100000'
    }]
  },
  optimization: {
    minimizer: [new UglifyJsPlugin()]
  },
  mode: 'development'
}