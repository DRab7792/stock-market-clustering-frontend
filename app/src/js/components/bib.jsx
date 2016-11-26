var React = require('react'),
	config = require('../config'),
	_  = require('underscore'),
	async = require('async'),
	Source = require('./source.jsx'),
	ReactDOM = require('react-dom'),
	ReactBackbone = require('react.backbone');

var Bibliography = React.createBackboneClass({
	getInitialState: function() {
	    return {
	    	bibtex: null,
	    	downloadUrl: null
	    };
	},
	getBibtex: function(callback){
		var self = this;
		var callbackIn = (callback) ? callback : function(){};

		this.props.actionHandler({
	    	controller: "pages",
	    	method: "bib",
	    	isVar: true,
	    }, {}, function(err, res){
			if (err){
				return console.log("Error getting options", err);
			}

			self.setState({
				bibtex: res,
			}, callbackIn);
		});
	},
	componentDidMount: function() {
		var self = this;

		self.getDownloadUrl();
		self.getBibtex();
	},
	getDownloadUrl: function(){
		var self = this;

		this.props.actionHandler({
	    	controller: "pages",
	    	method: "wpOptions",
	    	isVar: true,
	    }, {}, function(err, res){
			if (err){
				return console.log("Error getting options", err);
			}

			self.setState({
				downloadUrl: res.theme.bibliography
			});
		});
	},
	formSources: function(){
		var self = this;

		if (!self.state.bibtex) return null;

		// console.log(self.state.meta.stack);
		var sources = _.map(self.state.bibtex.get("references"), function(cur){
			return <li key={cur.entyrkey}>
				<Source entry={cur} />
			</li>;
		});


		return (<ol className="p-bib__list" key="sources-list">
			{sources}
		</ol>);
	},
	render: function(){
		var self = this;
		if (!self.state.bibtex) return null;

		var sources = self.formSources();

		var link = null;
		if (self.state.downloadUrl){
			link = <a href={self.state.downloadUrl} className="p-bib__download" target="_blank">
				<i className="fa fa-cloud-download"></i>
			</a>
		}
		
		return (<div className="p-bib">
			<h2 className="p-bib__title">
				{"Sources"}
				{link}
			</h2>
			{sources}
		</div>);
	}
});

module.exports = Bibliography;