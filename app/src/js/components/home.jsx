var React = require('react'),
	config = require('../config'),
	_  = require('underscore'),
	ReactBackbone = require('react.backbone');

var Home = React.createBackboneClass({
	getInitialState: function() {
	    return {
	    	meta: null,
	    };
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
				if (cur.get("slug") == "home"){
					meta = cur.get("meta");
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
	formHero: function(){
		var hero = null,
			self = this;
		if (!self.state.meta.hero) return hero;

		var assetsUrl = config.app.assetsUrl;

		var bg = null,
			mod = "";
		if (self.state.meta.hero.type === "video"){
			mod = "p-home-hero__overlay__video";
			bg = (<video className="p-home-hero__video" src={assetsUrl+self.state.meta.hero.asset} autoPlay loop muted/>);
		}else if (self.state.meta.hero.type === "image"){
			bg = (<img className="p-home-hero__image" style={{backgroundImage: assetsUrl+self.state.meta.hero.asset}}/>);
		}

		hero = (<div className="p-home-hero">
			{bg}
			<div className={"p-home-hero__overlay " + mod}>
				<h1 className="p-home-hero__title">{self.state.meta.hero.title}</h1>
			</div>
		</div>);
		return hero;
	},
	render: function(){
		var self = this;
		if (!self.state.meta) return null;

		var assetsUrl = config.app.assetsUrl;

		var hero = self.formHero();

		return (<div className="p-home">
			{hero}
		</div>);
	}
});

module.exports = Home;