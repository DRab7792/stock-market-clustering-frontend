var BaseView = require('../base-view'),
	React = require('react'),
	ReactDOM = require('react-dom'),
	MainComponent = require('../components/main.jsx');

var MainView = BaseView.extend({
	render: function(curRoute){
		this.options.curRoute = curRoute;

		ReactDOM.render(
			<MainComponent 
				{...this.options}
			/>, 
			this.el
		);
		return this;
	}
});

module.exports = MainView;