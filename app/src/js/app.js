var Backbone = require('backbone'),
	Router = require('./router'),
	MainView = require('./screens/main/index'),
	PageController = require('./controllers/page'),
	PaperController = require('./controllers/paper'),
	config = require('./config'),
	WPAPI = require('wpapi');


Backbone.$ = $;

var Application = function(){
	this.initialize();
}

Application.prototype.initialize = function(){
	this.wpapi = new WPAPI({ endpoint: config.wpApiUrl });

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
		router: this.router
	});

	this.showApp();
};

Application.prototype.showApp = function(){
	this.mainView.render();
	Backbone.history.start({ pushState: true });
};

module.exports = Application;