const path = require('path');

module.exports = {
  entry: './src/index.ts',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      },
      { test: /\.ts(x?)$/, loader: "babel-loader?presets[]=es2015!ts-loader" }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    filename: 'agGridIntegration.js',
    libraryTarget: "window",
    library:"agGridIntegration",
    path: path.resolve(__dirname, '../agGridViz/src')
  }
};