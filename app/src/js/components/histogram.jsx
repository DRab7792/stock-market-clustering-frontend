var React = require('react'),
	config = require('../config'),
	_  = require('underscore'),
	d3 = require('d3'),
	async = require('async'),
	ReactDOM = require('react-dom'),
	ReactBackbone = require('react.backbone');

var Histogram = React.createBackboneClass({
	getInitialState: function() {
	    return {
	    	companies: null
	    };
	},
	getCompanies: function(callback){
		var self = this;
		var callbackIn = (callback) ? callback : function(){};

		this.props.actionHandler({
	    	controller: "data",
	    	method: "getAllCompanies"
	    }, {}, function(err, res){
			if (err){
				return console.log("Error getting options", err);
			}

			self.setState({
				companies: res,
			}, callbackIn);
		});
	},
	componentDidMount: function() {
		var self = this;

		self.getCompanies();
	},
	formSvg: function(){
		var self = this;

		//Find container
		var container = null,
			wpId = self.props.wpInfo.get("wpid");
		console.log($(".c-visual"));
		$(".c-visual").each(function(){
			var curId = parseInt($(this).data("id"));
			console.log(wpId, curId);
			if (wpId === curId){
				container = $(this);
				return false;
			}
		});

		console.log(container);

		if (!container) return null;

		var svg = d3.select(container)
			.append("svg");
	},
	render: function(){
		var self = this;

		if (!self.state.companies){
			self.formSvg();
		}

		return null;
	}
});

module.exports = Histogram;