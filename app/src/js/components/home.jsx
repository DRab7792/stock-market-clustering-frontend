var React = require('react'),
	config = require('../config'),
	_  = require('underscore'),
	async = require('async'),
	ReactBackbone = require('react.backbone');

var Home = React.createBackboneClass({
	getInitialState: function() {
	    return {
	    	meta: null,
	    	papers: null,
	    };
	},
	getPapers: function(){
		var self = this,
			paper = null,
			proposal = null;

		async.series([
			function(done){
				self.props.actionHandler({
			    	controller: "pages",
			    	method: "paper",
			    	isVar: true,
			    }, {}, function(err, res){
					if (err){
						return done(err);
					}

					paper = res;

					return done();
				});
			},
			function(done){
				self.props.actionHandler({
			    	controller: "pages",
			    	method: "proposal",
			    	isVar: true,
			    }, {}, function(err, res){
					if (err){
						return done(err);
					}

					proposal = res;

					return done();
				});
			}
		], function(err){
			if (err){
				return console.log("Error getting papers", err);
			}

			self.setState({
				papers: {
					paper: paper,
					proposal: proposal
				}
			});
		});
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
		self.getPapers();
	},
	formHero: function(){
		var hero = null,
			self = this;
		if (!self.state.meta.hero) return hero;

		var assetsUrl = config.app.assetsUrl;

		console.log(assetsUrl);

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
	formIconSection: function(){
		var self = this,
			icons = null;
		if (!self.state.meta.icons) return icons;

		var sections = _.map(self.state.meta.icons, function(cur){
			return <div className="p-home-icons__section">
				<i className={"p-home-icons__icon fa fa-"+cur.class} />
				<p className="p-home-icons__description">{cur.description}</p>
			</div>;
		});

		icons = (<div className="p-home-icons">
			{sections}
		</div>);

		return icons;
	},
	formAbstract: function(){
		var self = this, abstract = null;

		var body = "";

		var source = self.state.meta.misc.abstract;
		
		if (self.state.papers[source]){
			body = self.state.papers[source].get("abstract");
		}

		abstract = (<div className="p-home-abstract">
			<div className="p-home-abstract__container">
				<h2 className="p-home-abstract__title">Abstract</h2>
				<p className="p-home-abstract__body">{body}</p>
			</div>
		</div>);

		return abstract;
	},
	render: function(){
		var self = this;
		if (!self.state.meta || !self.state.papers) return null;

		var assetsUrl = config.app.assetsUrl;

		var hero = self.formHero(),
			iconSection = self.formIconSection(),
			abstract = self.formAbstract();

		return (<div className="p-home">
			{hero}
			{iconSection}
			{abstract}
		</div>);
	}
});

module.exports = Home;