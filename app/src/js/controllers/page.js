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

			self.paper = deepCopy(new Latex({
				url: self.wpOptions.theme.paper
			}));

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
				!self.wpOptions.theme.bibliography
			){
				return done("No bibliography url");
			}

			self.bib = deepCopy(new Bibtex({
				url: self.wpOptions.theme.bibliography
			}));

			self.bib.fetch({
				dataType: 'text',
				success: function(model, response, options){
					return done();
				},
				error: function(model, response, options){
					return done("Error loading bibliography");
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

			self.proposal = deepCopy(new Latex({
				url: self.wpOptions.theme.proposal
			}));

			self.proposal.fetch({
				dataType: 'text',
				success: function(){
					return done();
				},
				error: function(){
					return done("Error loading proposal");
				}
			});
		}
	], function(err){
		self.proposal.bibtex = self.bib;
		self.paper.bibtex = self.bib;

		return callbackIn(err);
	});
}

PageController.prototype.showHome = function(){
	console.log("home");
	this.app.mainView.render("home");
};

PageController.prototype.showProposal = function(data){
	var section = data[0];
	console.log("proposal", section);
	this.app.mainView.render("proposal", section);
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

PageController.prototype.showPaper = function(data){
	var section = data[0];
	console.log("paper", section);
	this.app.mainView.render("paper", section);
};

module.exports = PageController;