var config = {};

config.app = {
	title: "Stock Market Clustering",
	optionsUrl: "http://bigdata.dan-rabinowitz.com/options",
	wpApiUrl: "http://bigdata.dan-rabinowitz.com/wp-json",
};


if (location && location.href){
	var url = location.href;
	config.app.baseUrl = url;
	var cut = url.lastIndexOf("/");
	url = url.substring(0, cut) + "/";
	config.app.assetsUrl = url + "assets/";
}

module.exports = config;