var React = require('react'),
	config = require('../config'),
	_ = require('underscore'),
	ReactDOM = require('react-dom'),
	ReactBackbone = require('react.backbone');

var Code = React.createBackboneClass({
	getInitialState: function() {
	    return { meta: null };
	},
	getMeta: function(){
		var self = this;
		this.props.actionHandler({
	    	controller: "pages",
	    	method: "pages",
	    	isVar: true,
	    }, {}, function(err, res){
			if (err){
				return console.log("Error getting options", err);
			}
			
			var meta = null;
			_.each(res.models, function(cur){
				console.log(cur.get("slug"));
				if (cur.get("slug") == "code"){
					meta = cur.get("meta");
					return;
				}
			});

			self.setState({
				meta: meta
			});
		});
	},
	componentDidMount: function() {
		var self = this;
		self.getMeta();
	},
	render: function(){
		var self = this;
		if (
			this.state.meta &&
			this.state.meta.misc && 
			this.state.meta.misc.repo
		){
			window.open(this.state.meta.misc.repo);
			this.props.router.navigate("", {trigger: true});
		}

		return null;
	}
});

module.exports = Code;