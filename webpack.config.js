const path = require('path');

module.exports = {
	entry: './client/telepClient.js',
	mode: 'development',
	devtool: 'eval-source-map',
	output: {
		filename: 'telephenesis.js',
		path: path.resolve(__dirname, 'public')
	},
	module: {
		rules: [
			{ test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
		]
	},
	watch: true
};
