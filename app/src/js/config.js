var config = {};

config.app = {
	title: "Stock Market Clustering",
	optionsUrl: "http://bigdata.dan-rabinowitz.com/options",
	wpApiUrl: "http://bigdata.dan-rabinowitz.com/wp-json",
	clearbit: {
		api_key: "sk_1281a353f301a17827058fd90a480834"
	},
	movingAvgWindow: 15
};


if (location && location.href){
	var url = location.href;
	config.app.baseUrl = url;
	var cut = url.lastIndexOf("/");
	url = url.substring(0, cut) + "/";
	config.app.assetsUrl = url + "assets/";
	config.app.dataUrl = url + "data/";
}

module.exports = config;