module.exports = function(component){
	component.visuals = {};

	require('./histogram.js')(component.visuals);
	require('./lineChart.js')(component.visuals);
};