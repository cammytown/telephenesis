const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = [{
	entry: './client/telepClient.js',
	mode: 'development',
	devtool: 'eval-source-map',
	output: {
		filename: 'telephenesis.js',
		path: path.resolve(__dirname, 'public')
	},
	module: {
		rules: [
			{ 
				test: /\.js$/,
				exclude: /node_modules/,
				loader: "babel-loader"
			},
			// {
			// 	test: /\.s[ac]ss$/i,
			// 	exclude: /node_modules/,
			// 	use: [
			// 		// process.env.NODE_ENV !== "production"
			// 		// 	? "style-loader" // fallback to style-loader in development
			// 		// 	: MiniCssExtractPlugin.loader,
			// 		MiniCssExtractPlugin.loader,
			// 		{ loader: "css-loader", options: { url: false }},
			// 		"sass-loader"
			// 	]
			// }
		]
	},
	// plugins: [
	// 	new MiniCssExtractPlugin({
	// 		filename: "constellationsMiniCss.css"
	// 	})
	// ],

	watch: true
}]
