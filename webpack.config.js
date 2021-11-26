const path = require('path');
const fs = require('fs');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const nodeExternals = require('webpack-node-externals');

module.exports = [{
	entry: './client/js/telepClient.js',
	mode: 'production',
	//devtool: 'eval-source-map',
	output: {
		filename: 'telephenesis.js',
		path: path.resolve(__dirname, 'public')
	},
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				//exclude: /node_modules/,
				include: [
					//path.resolve(__dirname, 'node_modules/nano-jsx/'),
					path.resolve(__dirname, 'abstract/'),
					//path.resolve(__dirname, 'locale/'),
					path.resolve(__dirname, 'client/js/'),
				],
				loader: "babel-loader",
				options: {
					///REVISIT don't know why we need this and future versions
					//of babel probably don't:
					//...JSON.parse(fs.readFileSync(path.resolve(__dirname, '../.babelrc'))),
					babelrc: true,
				},
			},
			{
				test: /\.scss$/i,
				exclude: /node_modules/,
				use: [
					// process.env.NODE_ENV !== "production"
					// 	? "style-loader" // fallback to style-loader in development
					// 	: MiniCssExtractPlugin.loader,
					// MiniCssExtractPlugin.loader,
					"style-loader",
					{ loader: "css-loader", options: {
						// url: false,
						modules: {
							compileType: 'icss'
						}
					}},
					"sass-loader"
				]
			}
		]
	},
	// plugins: [
	// 	new MiniCssExtractPlugin({
	// 		filename: "constellationsMiniCss.css"
	// 	})
	// ],

	// watch: true
}]
