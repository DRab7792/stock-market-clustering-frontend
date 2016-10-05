var PageCollection = require('../collections/pages');


var PageController = function(options){
	this.app = options.app;	
	this.pages = [];
	this.wpOptions = null;
};

PageController.prototype.initialLoad = function(callback){
	var self = this,
		callbackIn = (callback) ? callback : function(){};

	self.loadPages(function(){
		self.loadOptions(function(){
			return callbackIn();
		});
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