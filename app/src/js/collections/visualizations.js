var Backbone = require('backbone'),
	Visual = require('../models/visual'),
	_ = require('underscore');

var visuals = Backbone.Collection.extend({
	model: function(){
		return new Visual();
	},
	initialize: function(options){
		this.options = options || {};
	},
	fetch: function(data, callback){
		var self = this;
		//Make sure there is a wp api object
		if (!this.options.wpApi){
			return console.log("Missing wp api");
		}

		//Call the pages function in the rest api object
		this.options.wpApi.getVisuals(function(err, data){
			if (err){
				return console.log("Error getting wp visualizations", err);
			}

			//Clear out the existing model and parse the new visualizations
			self.first().destroy();
			_.each(data, function(cur){
				var newVisual = new Visual();

				newVisual.parse(cur);

				self.add(newVisual);
			});

			return callback && callback(self);
		});
	},
});

module.exports = visuals;