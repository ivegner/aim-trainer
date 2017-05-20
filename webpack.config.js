var path = require('path');

module.exports = {
  entry: './webpack.reqs.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public')
  }
};