var request = require('request'),
	fs = require('fs'),
	_ = require('underscore'),
	async = require('async'),
	config = require('../gulp-config.js'),
	Clearbit = require('clearbit').Client,
	Promise = require('bluebird'),
	unzip = require('node-unzip-2'),
	wget = require('node-wget');

var clearbit = new Clearbit({key: config.clearbit.key});

//Build the data services layer
module.exports = {
	extractKaggleDataset: function(){
		return new Promise(function(resolve, reject){
			var read = fs.createReadStream('data/us-stocks-fundamentals.zip');

			read.pipe(unzip.Extract({
				path: 'data/kaggle'
			})).on('close', function(){
				resolve();
			}).on('error', function(err){
				console.log("Error extracting dataset", err);
				reject(err);
			});
		});
	},
	getCompanySymbols: function(){
		return new Promise(function(resolve, reject){
			var companies = require('../data/kaggle/companies.json');
			
			companies = companies.splice(0, config.kaggle.maxCompanies);

			var adjCompanies = [];
			async.each(companies, function(cur, done){

				var name = cur.name_latest;

				var url = "http://d.yimg.com/autoc.finance.yahoo.com/autoc?query=" + name + "&region=US&lang=en-US";

				request(url, function (error, response, body) {
		            if (error || response.statusCode != 200) {
		                return done("Error retrieving name");
		            }

		            var res;
		            try {
		                res = JSON.parse(body);
		            } catch (e) {
		                return done("Error retrieving name");
		            }

		            if (
		            	!res.ResultSet ||  
		            	!res.ResultSet.Result || 
		            	!res.ResultSet.Result.length
		            ){	
		            	console.log("No symbol result on yahoo found for ", name);
		            	adjCompanies.push(cur);
		            	return done();
		            }

		            var compInfo = res.ResultSet.Result[0];

		            //Check the company name and save the symbol info
		            if (
		            	compInfo.name.indexOf(name) !== -1 && 
		            	compInfo.exch && 
		            	compInfo.type && 
		            	compInfo.symbol && 
		            	compInfo.exchDisp && 
		            	compInfo.typeDisp
		            ){
		            	cur.exch = compInfo.exch;
		            	cur.type = compInfo.type;
		            	cur.symbol = compInfo.symbol;
		            	cur.exchDisp = compInfo.exchDisp;
		            	cur.typeDisp = compInfo.typeDisp;
		            }

		            adjCompanies.push(cur);
		            return done();
				});
			}, function(err){
				if (err){
					return reject(err);
				}

				return resolve(adjCompanies);
			});
		});
	},
	getCompanyAttributes: function(companies){
		return new Promise(function(resolve, reject){
			//Form the id hash
			var map = {};
			companies.forEach(function(cur, index){
				map[cur.company_id+""] = index;
			});
			var ids = Object.keys(map);

			//Initiate the stream
			var stream = fs.createReadStream('data/kaggle/indicators_by_company.csv');

			stream.on('data', function(chunk){
				//Split the lines and the cells
				var data = chunk.toString('utf-8').split("\n");

				_.each(data, function(cur){
					var line = cur.split(",");

					//Only account for the specified attributes
					if (
						_.contains(ids, line[0]) &&
						_.contains(config.kaggle.attributes, line[1]) && 
						line.length === 9
					){
						var vals = {
							"2010": parseInt(line[2]),
							"2011": parseInt(line[3]),
							"2012": parseInt(line[4]),
							"2013": parseInt(line[5]),
							"2014": parseInt(line[6]),
							"2015": parseInt(line[7]),
							"2016": parseInt(line[8])
						};

						var compId = map[line[0]];

						if (!companies[compId]['attributes']){
							companies[compId]['attributes'] = {};
						}

						//Add the attributes to the company
						companies[compId]['attributes'][line[1]] = vals;
					}
				});
			}).on('end', function(){

				return resolve(companies);
			});
		});
	},
	getIndustries: function(companies){
		return new Promise(function(resolve, reject){
			async.each(companies, function(cur, done){
				var compName = cur.name_latest;

				compName = compName.replace(" Corp", "");
				compName = compName.replace(" Inc", "");
				compName = compName.trim();

				clearbit.Discovery.search({
					query: {
						or: [
							{ticker: cur.symbol},
							{name: compName}
						]
					}
				}).then(function(search){
					//If results were found, use the first one and save the category
					if (search.results.length){
						cur.clearbit_id = search.results[0].id;
						cur.category = search.results[0].category;

						//If there is no existing symbol, add one from clearbit
						if (!cur.symbol && search.results[0].ticker){
							cur.symbol = search.results[0].ticker;
						}
					}else{
						console.log("Could not find Clearbit results for ", cur.name_latest);
					}
					return done();
				}).catch(function(err){
					console.log("Error getting industry", err);
					return done(err);
				});

			}, function(err){
				if (err){
					return reject(err);
				}

				return resolve(companies);
			});
		});
	},
	getStockHistory: function(companies){
		return new Promise(function(resolve, reject){
			async.each(companies, function(cur, done){
				if (!cur.symbol) return done();

				var url = "https://query.yahooapis.com/v1/public/yql?format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys";
				var query = 'SELECT * FROM yahoo.finance.historicaldata WHERE symbol = "' + cur.symbol + '" AND startDate = "' + config.yahoo.startDate + '" AND endDate = "' + config.yahoo.endDate + '"';
				url += "&q=" + encodeURIComponent(query);

				request(url, function (error, response, body) {
		            if (error || response.statusCode != 200) {
		                return done("Error retrieving name");
		            }

		            //Parse results
		            var res;
		            try {
		                res = JSON.parse(body);
		            } catch (e) {
		                return done("Error retrieving name");
		            }

		            //Check results
		            if (
		            	!res.query || 
		            	!res.query.results || 
		            	!res.query.results.quote
		            ){
		            	console.log("Couldn't get stock quotes for ", cur.name_latest);
		            	return done();
		            }

		            cur.stock_prices = res.query.results.quote;

		            return done();
				});
			}, function(err){
				if (err){
					return reject(err);
				}

				return resolve(companies);
			});
		});
	},
	saveCompanies: function(companies){
		return new Promise(function(resolve, reject){
			var path = __dirname + "/../data/companies/";
			async.each(companies, function(cur, done){
				if (!cur.symbol) return done();

				var file = path + cur.symbol + ".json";

				var data = JSON.stringify(cur);

				fs.writeFile(file, data, function(err){
					if (err){
						console.log("Error writing file", err);
						return done(err);
					}

					return done();
				});
			}, function(err){
				if (err){
					return reject(err);
				}

				return resolve();
			});
		});
	},
	createCompanyList: function(){
		return new Promise(function(resolve, reject){
			fs.readdir('data/companies', function(err, files){
				if (err){
					console.log("Error getting file names", err);
					return reject(err);
				}

				var companies = [];
				_.each(files, function(cur){
					var company = cur.substring(0, cur.indexOf(".json"));

					if (company !== "directory") companies.push(company);
				});

				fs.writeFile('data/companies/directory.json', JSON.stringify(companies), function(err){
					if (err){
						console.log("Error writing companies json", err);
						return reject(err);
					}

					return resolve();
				});
			});
		});
	}
};