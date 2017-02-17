/* eslint-env node */

module.exports = {
  externals: {
    jquery: 'jQuery',
  },
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader',
      query: {
        presets: ['behance'],
      },
    }],
  },
  plugins: [],
};
