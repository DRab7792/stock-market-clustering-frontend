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
	    	bibtex: null
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


		self.getBibtex();
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

		// console.log("Render");
		return (<div className="p-bib">
			<h2 className="p-bib__title">Sources</h2>
			{sources}
		</div>);
	}
});

module.exports = Bibliography;