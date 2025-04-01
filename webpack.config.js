module.exports = {
  // ...existing webpack config if any...
  
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
        exclude: [/node_modules\/html2pdf\.js/]
      }
    ]
  },
  
  ignoreWarnings: [
    {
      module: /html2pdf\.js/,
      message: /Failed to parse source map/
    }
  ]
};
