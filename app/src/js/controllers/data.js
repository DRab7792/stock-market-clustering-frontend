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
	this.sectors = null;
	this.clusters = null;
	this.combined = null;
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
	var callbackIn = callback ? callback : function(){};
	//Check the parameters
	if (!options.sectors){
		return callbackIn("Missing sectors");
	}

	//Make sure the companies have been loaded
	if (!self.companies){
		return callbackIn("No companies");
	}

 	if (!self.sectors){
 		self.sortCompaniesBySector();
 	}

 	//If all sectors are sorted, get the ones specified
 	var sectors = [];

 	_.each(self.sectors, function(cur){
 		if (_.contains(options.sectors, cur.name)){
 			sectors.push(cur);
 		}
 	});

 	return callbackIn(null, sectors);
};

DataController.prototype.sortCompaniesBySector = function(){
	var self = this;
	var sectors = {};

	//Form the sectors object
	_.each(self.companies.models, function(comp){
		if (
			!comp.get("category") || 
			!comp.get("category").sector
		){
			return;
		}
		var compSector = comp.get("category").sector;

		if (!sectors[compSector]){
			sectors[compSector] = new CompanyCollection();
		}

		sectors[compSector].add(comp);
	});

	//Mark the sectors as loaded and assign names
	_.each(Object.keys(sectors), function(curKey){
		var curSector = sectors[curKey];

		curSector.state = curSector.states.LOADED;

		curSector.name = curSector.models[0].get("category").sector;
	});

	self.sectors = sectors;

	return;
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

DataController.prototype.getCombined = function(options, callback){
	var self = this;
	var callbackIn = callback ? callback : function(){};

	//Check clusters and sectors
	if (!self.clusters){
		return callbackIn("Clusters are not set");
	}

	if (!self.sectors){
		return callbackIn("Sectors are not set");
	}

	//Combine groups if not already set
	if (!self.combined){
		self.combineGroups();
	}

	return callbackIn(null, self.combined);
};

DataController.prototype.combineGroups = function(){
	var self = this;
	var combined = {};

	//Form the combined groups
	_.each(self.clusters.clusters, function(curCluster){
		var clusterName = curCluster.name;

		_.each(curCluster.models, function(curComp){
			if (
				!curComp.get("category") || 
				!curComp.get("category").sector
			){
				return;
			}
			var compSector = curComp.get("category").sector,
				key = clusterName + compSector,
				description = clusterName + ", " + compSector;

			if (!combined[key]){
				combined[key] = new CompanyCollection();

				combined[key].description = description;
			}

			combined[key].add(curComp);
		});
	});

	//Eliminate all combined groups with only one company
	var i = 1;
	self.combined = [];
	_.each(Object.keys(combined), function(curKey){
		if (combined[curKey].models.length === 1){
			return;
		}

		combined[curKey].state = combined[curKey].states.LOADED;

		i++;

		self.combined.push(combined[curKey]);
	});

	//Sort by size
	self.combined = _.sortBy(self.combined, function(cur){
		return -cur.models.length;
	});

	//Only include the top 5 most populated combined groups
	self.combined = self.combined.slice(0, 5);

	//Assign names
	self.combined.forEach(function(cur, i){
		cur.name = "Combined " + (i + 1);
	});

	return;
}

module.exports = DataController;