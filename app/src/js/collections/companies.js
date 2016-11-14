var Backbone = require('backbone'),
	Company = require('../models/company'),
	_ = require('underscore');

var companies = Backbone.Collection.extend({
	model: function(){
		return new Company();
	},
	initialize: function(options){
		this.options = options || {};
	},
	fetch: function(data, callback){
		var self = this;
		
		var companyList = require('../../data/directory.json');

		var modules = _.map(companyList, function(cur){
			var filename = "../../data/" + cur + ".json";

			return filename;
		});

		console.log(modules);
		var companyData = require(modules, function(companyData){
			var company = new Company();

			console.log(companyData.name_latest);

			company.parse(companyData);

			self.add(company);
		});

		return this;
	},
});

module.exports = companies;