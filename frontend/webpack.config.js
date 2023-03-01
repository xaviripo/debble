const webpack = require('webpack');

module.exports = {

  entry: __dirname + '/src/index.js',

  output: {
    path: __dirname + '/../debble/static',
    filename: 'bundle.js',
  },

  resolve: {
    extensions: ['.js', '.jsx', '.css'],
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)?/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ]
  }

};
