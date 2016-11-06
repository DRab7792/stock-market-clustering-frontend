var React = require('react'),
	_ = require('underscore'),
	config = require('../config'),
	ReactBackbone = require('react.backbone');

var SectionList = React.createBackboneClass({
	getInitialState: function() {
		
	    return {
			selected: null,
	    };
	},
	handleNavClick: function(e){
		var el = $(e.currentTarget);
		var route = el.data("route");
		route = this.props.source + "/" + route;
		this.props.router.navigate(route, {trigger: true});
	},
	render: function(){
		var self = this;
		if (!this.props.sections.length) return null;

		var links = _.map(this.props.sections, function(cur){

			return <li onClick={self.handleNavClick} data-route={cur.slug} className="c-sections__link" key={cur.slug}>
				<span>{cur.title}</span>
			</li>;
		});


		return (<ul className={"c-sections "+this.props.extraClasses}>
			{links}
		</ul>);
	}
});

module.exports = SectionList;