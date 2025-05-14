const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    content: './src/content.ts',
    script: './src/script.ts',
    'filter.test': './src/filter.test.ts'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js', '.test.ts']
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'src/index.html', to: 'index.html' },
        { from: 'src/style.css', to: 'style.css' },
        { from: 'manifest.json', to: 'manifest.json' },
        { from: 'src/assets', to: 'assets' }
      ]
    })
  ]
};
