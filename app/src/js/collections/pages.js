var Backbone = require('backbone'),
	Page = require('../models/page'),
	_ = require('underscore');

var pages = Backbone.Collection.extend({
	model: function(){
		return new Page();
	},
	initialize: function(options){
		this.options = options || {};
	},
	fetch: function(data, callback){
		var self = this;
		//Make sure there is a wp rest api object
		if (!this.options.wpRestApi){
			return console.log("Missing wp rest api");
		}

		//Call the pages function in the rest api object
		this.options.wpRestApi.pages(data).get(function(err, data){
			if (err){
				return console.log("Error getting wp pages", err);
			}

			_.each(data, function(cur){
				var newPage = new Page();

				newPage.parse(cur);

				self.add(newPage);
			});

			return callback && callback(self);
		});
	},
});

module.exports = pages;