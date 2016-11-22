var CompanyCollection = require('../collections/companies'),
	request = require('request'),
	async = require('async'),
	config = require('../config'),
	_ = require("underscore"),
	company = require('../models/company');

var MAX_VAL = 999999999999;

var DataController = function(options){
	this.app = options.app;	
	this.companies = [];
	this.clusters = null;
};

DataController.prototype.initialLoad = function(options, callback){
	var self = this,
		callbackIn = (callback) ? callback : function(){};

	//Make calls for pages, wp options and tex files
	async.series([
		function(done){
			self.loadCompanies(function(err){
				return done(err);
			});
		},
	], function(err){
		if (err){
			console.log("Error loading wordpress pages", err);
			return callbackIn(err);
		}

		//Get number of clusters
		self.app.actionHandler({
			controller: "pages",
	    	method: "wpOptions",
	    	isVar: true,
		}, {}, function(err, options){
			if (err){
				return console.log("Error getting options from page controller", err);
			}

			var k = options.data.clusters;

			//Calculate clusters
			self.calcClusters({
				clusters: k
			}, function(err){
				if (err){
					return console.log("Error calculating clusters", err);
				}

				return callbackIn();
			});
		});		
	});
};

DataController.prototype.loadCompanies = function(callback){
	var self = this,
	callbackIn = (callback) ? callback : function(){};

	self.companies = new CompanyCollection();

	this.companies.fetchAll({}, function(){
		return callbackIn();
	});
};

DataController.prototype.getAllCompanies = function(options, callback){
	var self = this;
	var callbackIn = callback ? callback : function(){};

	if (!self.companies){
		return self.loadCompanies(function(){
			callbackIn(null, self.companies);
		});
	}else{
		return callbackIn(null, self.companies);
	}
}

DataController.prototype.getCompaniesBySectors = function(options, callback){
	var self = this;
	var sectors = [];
	var callbackIn = callback ? callback : function(){};
	//Check the parameters
	if (!options.sectors){
		return callbackIn("Missing sectors");
	}

	//Make sure the companies have been loaded
	if (!self.companies){
		return callbackIn("No companies");
	}

	//Form the sectors array, async just in case
	async.each(options.sectors, function(cur, done){
		var curSector = new CompanyCollection();

		_.each(self.companies.models, function(comp){
			if (
				!comp.get("category") || 
				!comp.get("category").sector
			){
				return;
			}

			if (comp.get("category").sector === cur){
				curSector.add(comp);
			}
		});

		curSector.state = curSector.states.LOADED;

		curSector.name = curSector.models[0].get("category").sector;

		sectors.push(curSector);

		return done();
	}, function(err){
		//Handle error
		if (err){
			return callbackIn(err);
		}

		//Return array of company collections
		return callbackIn(null, sectors);
	});
};

//Calculate all data in order if necessary
DataController.prototype.calculateData = function(options, callback){
	var callbackIn = callback ? callback : function(){};
	if (!options.func || !options.groups){
		return callbackIn("Missing parameters");
	}

	var groups = options.groups, func = options.func;

	function checkStandardDevs(curComp){
		if (
			curComp.get("stockPrices") && 
			curComp.get("stockPrices").state < curComp.get("stockPrices").states.STANDARDDEVS
		) curComp.get("stockPrices").calculateStandardDeviations();
	}

	function checkSmoothDevs(curComp){
		if (
			curComp.get("stockPrices") && 
			curComp.get("stockPrices").state < curComp.get("stockPrices").states.SMOOTH
		){
			curComp.get("stockPrices").getMovingMean();
		}
	}

	function checkRanges(curGroup){
		if (curGroup.state < curGroup.states.RANGES) curGroup.getStdDevVariances();
	}

	if (func === "stdDeviation"){
		_.each(groups, function(curGroup){
			_.each(curGroup.models, function(curComp){
				checkStandardDevs(curComp);
			});
		});
	}else if (func === "smooth"){
		_.each(groups, function(curGroup){
			_.each(curGroup.models, function(curComp){
				checkStandardDevs(curComp);
				checkSmoothDevs(curComp);
			});
		});
	}else if (func === "ranges"){
		_.each(groups, function(curGroup){
			_.each(curGroup.models, function(curComp){
				checkStandardDevs(curComp);
				checkSmoothDevs(curComp);
			});
		});
		_.each(groups, function(curGroup){
			checkRanges(curGroup);
		});
	}

	return callbackIn(null, groups);
}


DataController.prototype.calcFeature = function(a, b, feature){
	var aVal = a.get("preppedAttributes")[feature],
		bVal = b.get("preppedAttributes")[feature];

	//Divide by 10 million to normalize the data
	if (aVal) aVal = (aVal / 10000000).toFixed(3);
	if (bVal) bVal = (bVal / 10000000).toFixed(3);

	if (aVal && bVal){
		return Math.abs(aVal - bVal);
	}else if (aVal && !bVal){
		return Math.abs(aVal);
	}else if (!aVal && bVal){
		return Math.abs(bVal);
	}else{
		return 0;
	}
}

DataController.prototype.calcDistance = function(center, comp){
	var self = this, sum = 0;

	var compFeatures = Object.keys(comp.get("preppedAttributes")),
		centerFeatures = Object.keys(center.get("preppedAttributes"));

	var features = _.intersection(compFeatures, centerFeatures);

	_.each(features, function(feature){
		var diff = self.calcFeature(center, comp, feature);
		sum += Math.pow(diff, 2);
	})

	return Math.sqrt(sum);
}

DataController.prototype.assignCompaniesToClusters = function(clusters, companies){
	var self = this, totalDist = 0;

	_.each(companies, function(curComp){
		var distances = [];

		//Calc distances
		_.each(clusters, function(curCluster){
			distances.push(self.calcDistance(curCluster.center, curComp));
		});

		//Now pick the minimum distance and assign the company to that cluster
		var minCluster = null, minDist = MAX_VAL;
		clusters.forEach(function(curCluster, i){
			if (distances[i] < minDist){
				minCluster = curCluster;
				minDist = distances[i];
			}
		});

		//Update total distance
		totalDist += minDist;

		//Assign the company to the cluster
		minCluster.add(curComp);
	});

	return totalDist;
};

//Perform the clustering
DataController.prototype.calcClusters = function(options, callback){
	var self = this;
	var callbackIn = callback ? callback : function(){};
	
	//Check the parameters and the data
	if (!options.clusters || options.clusters > 10 || options.clusters < 0){
		return callbackIn("Missing k value");
	}

	if (!self.companies){
		return callbackIn("No companies loaded");
	}

	//Prepare all the attributes for each company
	self.companies.prepCompanyAttributes();

	//Start clustering the companies
	var allCompanies = self.companies.models,
		initialDist = MAX_VAL,
		totalDist = 0,
		firstPass = true,
		history = [];

	while (totalDist < initialDist){
		//Update the distances
		if (!firstPass){
			initialDist = totalDist;
			totalDist = 0;
		}

		//No longer a first pass
		if (config.app.debug) console.log("Initial Distance", initialDist);
		if (firstPass) firstPass = false;

		//Clear clusters and shuffle the companies
		var clusters = [];
		allCompanies = _.shuffle(allCompanies);

		//Create clusters and assign a center
		for (var i = 0; i < options.clusters; i++) {
			var newCluster = new CompanyCollection();
			newCluster.id = i;
			newCluster.center = allCompanies[i];
			clusters.push(newCluster);
		}

		//Assign companies to each cluster
		totalDist = self.assignCompaniesToClusters(clusters, allCompanies, totalDist);

		//Remember these clusters and distance
		var iteration = {
			clusters: clusters,
			distance: totalDist
		};

		history.push(iteration);

		if (config.app.debug){
			console.log("Total Distance", totalDist);
		}
	}

	//Save the best configuration
	if (config.app.debug){
		console.log("History", history);
	}

	var bestClusters = history[(history.length - 2)];

	//Assign a cluster to each company
	var i = 1;
	_.each(bestClusters.clusters, function(curCluster){
		var center = curCluster.center;

		curCluster.name = "Cluster " + i;

		_.each(curCluster.models, function(curComp){
			var cur = {};
			if (curComp.get("id") === center.get("id")){
				cur.isCenter = true;
				cur.distFromCenter = 0;
			}else{
				cur.isCenter = false;
				cur.distFromCenter = self.calcDistance(center, curComp);
			}
			curComp.set("cluster", cur);

			curComp.set("state", curComp.states.CLUSTERED);
		});

		i++;
	});

	self.clusters = bestClusters;
	return callbackIn(null, bestClusters);
}

DataController.prototype.getClusters = function(options, callback){
	var self = this;
	var callbackIn = callback ? callback : function(){};

	if (!self.clusters){
		return callbackIn("Clusters not set");
	}

	return callbackIn(null, self.clusters);
};

module.exports = DataController;