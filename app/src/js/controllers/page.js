var PageCollection = require('../collections/pages'),
	request = require('request'),
	async = require('async'),
	Latex = require('../models/latex'),
	Bibtex = require('../models/bibtex');


var PageController = function(options){
	this.app = options.app;	
	this.pages = [];
	this.wpOptions = null;
	this.paper = null;
	this.proposal = null;
	this.bib = null;
};

PageController.prototype.initialLoad = function(callback){
	var self = this,
		callbackIn = (callback) ? callback : function(){};

	//Make calls for pages, wp options and tex files
	async.series([
		function(done){
			self.loadPages(function(err){
				return done(err);
			});
		},
		function(done){
			self.loadOptions(function(err){
				return done(err);
			});
		},
		function(done){
			self.loadTex(function(err){
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

PageController.prototype.loadOptions = function(callback){
	var self = this,
		callbackIn = (callback) ? callback : function(){};

	this.app.controllers.wpApi.getOptions(function(err, res){
		if (err){
			console.log("Error getting wp options");
			return callbackIn("Error getting wp options");
		}

		self.wpOptions = res;

		return callbackIn();
	});
};

PageController.prototype.loadPages = function(callback){
	var self = this,
		callbackIn = (callback) ? callback : function(){};

	self.pages = new PageCollection({
		wpRestApi: this.app.controllers.wpApi.rest
	});

	this.pages.fetch({}, function(){
		return callbackIn();
	});
};

PageController.prototype.loadTex = function(callback){
	var self = this,
		callbackIn = (callback) ? callback : function(){};

	async.series([
		function(done){
			if (
				!self.wpOptions ||
				!self.wpOptions.theme || 
				!self.wpOptions.theme.paper
			){
				return done("No paper url");
			}

			self.paper = new Latex({
				url: self.wpOptions.theme.paper
			});

			self.paper.fetch({
				dataType: 'text',
				success: function(model, response, options){
					return done();
				},
				error: function(model, response, options){
					return done("Error loading paper");
				}
			});
		},
		function(done){
			if (
				!self.wpOptions ||
				!self.wpOptions.theme || 
				!self.wpOptions.theme.proposal
			){
				return done();
			}

			self.paper = new Latex({
				url: self.wpOptions.theme.proposal,
				success: function(){
					return done();
				},
				error: function(){
					return done("Error loading proposal");
				}
			});
		}
	], function(err){
		return callbackIn(err);
	});
}

PageController.prototype.showHome = function(){
	console.log("home");
	this.app.mainView.render("home");
};

PageController.prototype.showProposal = function(){
	console.log("proposal");
	this.app.mainView.render("proposal");
};

PageController.prototype.showCode = function(){
	console.log("code");
	this.app.mainView.render("code");
};

PageController.prototype.showSources = function(){
	console.log("sources");
	this.app.mainView.render("sources");
};

PageController.prototype.showStack = function(){
	console.log("stack");
	this.app.mainView.render("stack");
};

PageController.prototype.showOverview = function(){
	console.log("overview");
	this.app.mainView.render("overview");
};

PageController.prototype.showSection = function(){
	console.log("section");
	this.app.mainView.render("section");
};

PageController.prototype.showSubsection = function(){
	console.log("subsection");
	this.app.mainView.render("subsection");
};

module.exports = PageController;