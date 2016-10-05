var Backbone = require('backbone'),
	Router = require('./router'),
	MainView = require('./views/main'),
	PageController = require('./controllers/page'),
	config = require('./config'),
	WpController = require('./controllers/wpapi');


Backbone.$ = $;

var Application = function(){
	// console.log("hey");
	this.initialize();
}

Application.prototype.initialize = function(){
	var self = this;

	this.controllers = {
		wpApi: new WpController({ app: this }),
		pages: new PageController({ app: this }),
		// paper: new PaperController({ app: this }),
		// proposal: new PaperController({ app: this }),
		// sources: new BibController({ app: this }),
	};

	this.router = new Router({
		app: this,
		controllers: this.controllers
	});

	this.mainView = new MainView({
		el: $("#app"),
		app: this
	});

	this.startApp();
};

Application.prototype.startApp = function(){
	var self = this;
	Backbone.history.start({ pushState: true });

	this.controllers.pages.initialLoad(function(){
		self.controllers.pages.showHome();
	});
};

Application.prototype.actionHandler = function(id, data, callback){
	//Check params
	if (typeof callback !== "function"){
		return callback("Missing callback");
	}

	//Check identifier object
	if (
		!id.controller ||
		!id.method
	){
		return callback("Missing identifiers");
	}
	var getVar = id.isVar ? true : false,
		controller = id.controller,
		method = id.method;

	//Do the controller and method exist?
	if (
		!this.controllers[controller]
	){
		return callback("Incorrect identifiers");
	}

	//Get the data
	if (getVar){
		return callback(null, this.controllers[controller][method]);
	}else if (typeof this.controllers[controller][method] === "function"){
		this.controllers[controller][method](data, callback);
	}else{
		return callback("An error occurred");
	}
};

module.exports = Application;