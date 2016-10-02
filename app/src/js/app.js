var Backbone = require('backbone'),
	Router = require('./router'),
	MainView = require('./views/main'),
	PageController = require('./controllers/page'),
	PaperController = require('./controllers/paper'),
	config = require('./config'),
	WPAPI = require('./controllers/wpapi');


Backbone.$ = $;

var Application = function(){
	// console.log("hey");
	this.initialize();
}

Application.prototype.initialize = function(){

	this.wpApi = new WPAPI();

	this.controllers = {
		pages: new PageController({ app: this }),
		paper: new PaperController({ app: this })
	};

	this.router = new Router({
		app: this,
		controllers: this.controllers
	});

	this.mainView = new MainView({
		el: $("#app"),
		app: this
	});

	this.showApp();
};

Application.prototype.showApp = function(){
	this.mainView.render();
	Backbone.history.start({ pushState: true });
};

module.exports = Application;