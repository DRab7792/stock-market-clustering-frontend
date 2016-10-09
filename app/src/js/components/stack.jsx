var React = require('react'),
	config = require('../config'),
	_  = require('underscore'),
	async = require('async'),
	ReactDOM = require('react-dom'),
	Tooltip = require('react-tooltip'),
	ReactBackbone = require('react.backbone');

var Stack = React.createBackboneClass({
	getInitialState: function() {
	    return {
	    	meta: null,
	    	active: null,
	    };
	},
	getMeta: function(callback){
		var self = this;
		var callbackIn = (callback) ? callback : function(){};

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
				if (cur.get("slug") == "stack"){
					meta = cur.get("meta");
					return;
				}
			});

			var active = getSlug(meta.stack[0].title);

			self.setState({
				meta: meta,
				active: active
			}, callbackIn);
		});
	},
	triggerScroll: function(e){
		var self = this;
		var el = $(e.currentTarget);
		var slug = el.data('slug'),
			top = 0;
		
		var scrollPane = ReactDOM.findDOMNode(self.refs.pane);
		self.state.meta.stack.forEach(function(cur, index){
			var curSlug = getSlug(cur.title);
			var curItem = ReactDOM.findDOMNode(self.refs[slug]);

			var height = $(curItem).height();
			if (slug === curSlug){
				top = height * index;
				return;
			}
		});

		$(scrollPane).animate({
			scrollTop: top
		}, 400);
	},
	handleScroll: function(){
		var self = this;
		if (!self.state.meta.stack) return;

		var scrollPane = ReactDOM.findDOMNode(self.refs.pane);
		self.state.meta.stack.forEach(function(cur, index){
			var slug = getSlug(cur.title);
			var curItem = ReactDOM.findDOMNode(self.refs[slug]);

			var height = $(curItem).height();
			var scrollTop = $(scrollPane).scrollTop();
			
			var inView = Math.floor(scrollTop / height) === index;
			if (inView){
				self.setState({active: slug});
				return;
			}
		});
	},
	componentDidMount: function() {
		var self = this;

		self.getMeta(function(){
			var scrollPane = ReactDOM.findDOMNode(self.refs.pane);
			if (scrollPane){
				scrollPane.addEventListener("scroll", self.handleScroll);
			}
		});
	},
	componentWillUnmount: function() {
	    var scrollPane = ReactDOM.findDOMNode(this.refs.pane);
	    scrollPane.removeEventListener("scroll", this.handleScroll);
	},
	formStack: function(){
		var stack = null,
			self = this;

		var assetsUrl = config.app.assetsUrl;

		if (!self.state.meta.stack) return stack;

		var nav = _.map(self.state.meta.stack, function(cur){
			var slug = getSlug(cur.title);
			var active = self.state.active;
			var classes = "p-stack__nav-dot";
			if (active === slug){
				classes += " p-stack__nav-dot__selected";
			}
			return <li className={classes} data-tip data-for={slug} onClick={self.triggerScroll} key={slug} data-slug={slug}>
				<Tooltip place="right" id={slug} type="info" effect="solid">{cur.title}</Tooltip>
			</li>;
		});

		// console.log(self.state.meta.stack);
		var resources = _.map(self.state.meta.stack, function(cur){
			var slug = getSlug(cur.title);
			return <div className="p-stack__resource" key={slug} ref={slug}>
				<div className="p-stack__resource-container">
					<img className="p-stack__resource-image" src={assetsUrl+cur.image} />
					{/*<h3 className="p-stack__resource-title">{cur.title}</h3>*/}
					<p className="p-stack__resource-description">{cur.description}</p>
				</div>
			</div>;
		});

		return (<div className="p-stack__container">
			<div className="p-stack__nav">
				<ul className="p-stack__nav-dots">
					{nav}
				</ul>
			</div>
			<div className="p-stack__resources" ref="pane">
				{resources}
			</div>
		</div>);
	},
	render: function(){
		var self = this;
		if (!self.state.meta) return null;

		var stack = self.formStack();

		return (<div className="p-stack">
			<h2 className="p-stack__title">Stack</h2>
			{stack}
		</div>);
	}
});

module.exports = Stack;