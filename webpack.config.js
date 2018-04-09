const path = require('path');

module.exports = {
	entry: './src/telep.js',
	mode: 'development',
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
