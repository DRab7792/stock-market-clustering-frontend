var React = require('react'),
	config = require('../config'),
	_  = require('underscore'),
	async = require('async'),
	ReactDOM = require('react-dom'),
	ReactBackbone = require('react.backbone');

var Bibliography = React.createBackboneClass({
	getInitialState: function() {
	    return {
	    	bibtex: null
	    };
	},
	getMeta: function(callback){
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
		var sources = _.map(self.state.bibtex, function(cur){
			var slug = getSlug(cur.title);
			return <div className="p-stack__resource" key={slug} ref={slug}>
				<div className="p-stack__resource-container">
					<img className="p-stack__resource-image" src={assetsUrl+cur.image} />
					{/*<h3 className="p-stack__resource-title">{cur.title}</h3>*/}
					<p className="p-stack__resource-description">{cur.description}</p>
				</div>
			</div>;
		});

		return (<ul className="p-sources__list">
			{sources}
		</ul>);
	},
	render: function(){
		var self = this;
		if (!self.state.meta) return null;

		var sources = self.formSources();

		return (<div className="p-stack">
			<h2 className="p-stack__title">Sources</h2>
			{sources}
		</div>);
	}
});

module.exports = Bibliography;