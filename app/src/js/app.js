var Backbone = require('backbone'),
	Router = require('./router'),
	MainView = require('./views/main'),
	PageController = require('./controllers/page'),
	config = require('./config'),
	WpController = require('./controllers/wpapi');

Backbone.$ = $;

//Title case function
String.prototype.toTitleCase = function()
{
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

//Replace All
String.prototype.replaceAll = function(str1, str2, ignore) 
{
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
} 

window.deepCopy = function(obj){
	return $.extend(true, {}, obj);
}

window.clearData = function(obj){
	for (prop in obj){
		obj[prop] = undefined;
	}
}

window.getSlug = function(sectionTitle){
    return sectionTitle.toLowerCase().replaceAll(" ", "-");
};

window.isScrolledIntoView = function(elem, container){
    var $window = (!container) ? $(window) : container;

    var docViewTop = $window.scrollTop();
    var docViewBottom = docViewTop + $window.height();

    var elemTop = elem.offset().top;
    var elemBottom = elemTop + elem.height();

    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}

//External links
$("body").on("click", "a", function(e){
	var el = $(e.currentTarget);
	el = el[0];
	if (
		el.attributes && 
		el.attributes.target && 
		el.attributes.target.value && 
		el.attributes.target.value === "_blank"
	){
		// e.preventDefault();
	}
});

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
		if (window.localStorage.hash && window.localStorage.hash !== ""){
			self.router.navigate(window.localStorage.hash);
		}else{
			self.controllers.pages.showHome();	
		}
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