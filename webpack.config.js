const path = require('path');
const CopyWebpackPlugin= require("copy-webpack-plugin");
module.exports = {

	mode: 'development',

	entry: './src/Main.ts',

	module: {
		rules: [
			{
				test: /\.ts$/,
				use: 'ts-loader'
			}
		]
	},
	devServer: {
    contentBase: __dirname+"/dist/",
    inline: true,
    hot:false,
    port:53000,
    host: 'localhost',
    disableHostCheck:true,

    open:true,
    openPage: ''
  },
	resolve: {
		extensions: [
			'.ts','.js'
		]
		,
		modules: [
			path.resolve(__dirname, `./src/`), 
			path.resolve(__dirname, `./node_modules/`), 
		]
	}
	,
	plugins: [
	new CopyWebpackPlugin([
		{
			from: "./*.html",
			to:"./"
		},
		]),
	]
};
