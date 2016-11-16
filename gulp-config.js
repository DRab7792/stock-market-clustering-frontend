var config = {};

config.app = {
	title: "Stock Market Clustering",
	optionsUrl: "http://bigdata.dan-rabinowitz.com/options",
	wpApiUrl: "http://bigdata.dan-rabinowitz.com/wp-json",
}

config.kaggle = {
	attributes: [
		'Assets',
		'Cash',
		'IncomeTaxesPaid',
		'ProfitLoss',
		'Revenues',
		'Size'
	],
	maxCompanies: 200
};

config.clearbit = {
	key: 'sk_1281a353f301a17827058fd90a480834'
	// key: 'sk_dc7e23d9ee569c0c9196c90aa0055840'
};

config.yahoo = {
	startDate: "2015-01-01",
	endDate: "2016-01-01"
}

module.exports = config;