var config = {};

config.app = {
	title: "Stock Market Clustering",
	optionsUrl: "http://bigdata.dan-rabinowitz.com/options",
	wpApiUrl: "http://bigdata.dan-rabinowitz.com/wp-json",
	clearbit: {
		api_key: "sk_1281a353f301a17827058fd90a480834"
	},
	movingAvgWindow: 15,
	chartColors: [
		"#F15A5A",  
		"#FFA500",
		"#F0C419",
		"#4EBA6F", 
		"#2D95BF", 
		"#955BA5",
		"#FF69B4"
	],
	// chartColors: ["#8e8e93", "#ff2555", "#ff3b30", "#ff9500", "#ffcc00", "#3ed964", "#5ac8fa", "#2aaadc", "#07aff0", "#5856d6"],
	debug: false
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