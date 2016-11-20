var CompanyCollection = require('../collections/companies'),
	request = require('request'),
	async = require('async'),
	_ = require("underscore"),
	company = require('../models/company');

var DataController = function(options){
	this.app = options.app;	
	this.companies = [];
};

DataController.prototype.initialLoad = function(callback){
	var self = this,
		callbackIn = (callback) ? callback : function(){};

	//Make calls for pages, wp options and tex files
	async.series([
		function(done){
			self.loadCompanies(function(err){
				return done(err);
			});
		}
	], function(err){
		if (err){
			console.log("Error loading wordpress pages", err);
			return callbackIn(err);
		}

		return callbackIn();
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
	if (!options.func || !options.sectors){
		return callback("Missing function");
	}

	var sectors = options.sectors, func = options.func;

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

	function checkRanges(curSector){
		if (curSector.state < curSector.states.RANGES) curSector.getStdDevVariances();
	}

	if (func === "stdDeviation"){
		_.each(sectors, function(curSector){
			_.each(curSector.models, function(curComp){
				checkStandardDevs(curComp);
			});
		});
	}else if (func === "smooth"){
		_.each(sectors, function(curSector){
			_.each(curSector.models, function(curComp){
				checkStandardDevs(curComp);
				checkSmoothDevs(curComp);
			});
		});
	}else if (func === "variances"){
		_.each(sectors, function(curSector){
			_.each(curSector.models, function(curComp){
				checkStandardDevs(curComp);
				checkSmoothDevs(curComp);
			});
		});
		_.each(sectors, function(curSector){
			checkRanges(curSector);
		});
	}

	return callback(null, sectors);
}

module.exports = DataController;