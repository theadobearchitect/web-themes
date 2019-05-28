const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const postcssPresetEnv = require("postcss-preset-env");
const glob = require("glob");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const buildFunctions = require('./build-functions');
// We are getting 'process.env.NODE_ENV' from the NPM scripts
// Remember the 'dev' script?
const devMode = process.env.NODE_ENV !== 'production'
var fs = require('fs');

class FinalizeThemesPlugin {
	  constructor(name, command) {
		this.name = name;
		this.command = command;		
	  }

	  static execHandler(err, stdout, stderr) {
		if (stdout) process.stdout.write(stdout);
		if (stderr) process.stderr.write(stderr);
	  }

	  apply(compiler) {
		compiler.hooks['afterEmit'].tap(this.name, () => {
		  buildFunctions.finalizeThemes('./themes/');
		});
	  }
}
console.log("Step 1. Preparing Themes");
console.log("Step 1. Preparing Themes - Traverse recursively within the themes folder and create a SCSS file in tmp directory.") 
console.log("Step 1. Preparing Themes - Once the tmp directory has the SCSS file. SCSS compilation will happen.") 
buildFunctions.prepThemes('./themes/');
module.exports = {
  mode: devMode ? "development" : "production",
  entry:buildFunctions.allFilesSync('./tmp/'),// {'a':'./themes-scss/theme-consumer-default.scss','b':'./themes-scss/theme-consumer-store.scss'},  
  plugins: [
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: devMode ? '[name].css' : '[name].[hash].css',
      chunkFilename: devMode ? '[id].css' : '[id].[hash].css',
    }),
	new FinalizeThemesPlugin('RunTest', 'jest')	
  ],
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        use: [{
						// Extracts the CSS into a separate file and uses the
						// defined configurations in the 'plugins' section
						loader: MiniCssExtractPlugin.loader
					},
					{
						// Interprets CSS
						loader: "css-loader",
						options: {
							importLoaders: 2
						}
					},
					{
						// Use PostCSS to minify and autoprefix with vendor rules
						// for older browser compatibility
						loader: "postcss-loader",
						options: {
							ident: "postcss",
							// We instruct PostCSS to autoprefix and minimize our
							// CSS when in production mode, otherwise don't do
							// anything.
							plugins: devMode ?
								() => [] :
								() => [
									postcssPresetEnv({
										// Compile our CSS code to support browsers
										// that are used in more than 1% of the
										// global market browser share. You can modify
										// the target browsers according to your needs
										// by using supported queries.
										// https://github.com/browserslist/browserslist#queries
										browsers: [">1%"]
									}),
									require("cssnano")()
								]
						}
					},
					{
						// Adds support for Sass files, if using Less, then
						// use the less-loader
						loader: "sass-loader"
					}
        ],
      }
    ]
  }  
};
//