var _ = require("underscore"),
	async = require("async"),
	d3 = require("d3"),
	axis = require("d3-axis");

var histogram = {
	classPrefix: "c-histogram",
	data: {
		companies: [],
		categories: [],
		frequencies: []
	},
	initiate: function(options){
		var self = this;
		self.options = options || {};

		self.loadData(function(){
			self.prepareData();
			self.draw();
		});
	},
	loadData: function(callback){
		var self = this;
		this.options.actionHandler({
	    	controller: "data",
	    	method: "getAllCompanies",
	    }, {}, function(err, res){
			if (err){
				return console.log("Error getting companies", err);
			}

			self.data.companies = res;
			return callback();
		});
	},
	prepareData: function(){
		var self = this;

		//Check that a category is specified
		if (
			!self.data.companies.models ||
			!self.options.props || 
			!self.options.props.get("meta") ||
			!self.options.props.get("meta").data ||  
			!self.options.props.get("meta").data.category
		) return;

		var cat = self.options.props.get("meta").data.category;
		
		var frequencies = {};
		
		//Get the frequencies of all the companies by category
		_.each(self.data.companies.models, function(cur){
			if (
				!cur.get("category") || 
				!cur.get("category")[cat]
			){
				return;
			}

			var curCategory = cur.get("category")[cat];

			if (frequencies[curCategory]){
				frequencies[curCategory]++;
			}else{
				frequencies[curCategory] = 1;
			}
		});

		//Form an array of objects
		self.data.frequencies = _.map(Object.keys(frequencies), function(cur){
			return {key: cur, val: frequencies[cur]};
		});

		//Sort
		self.data.frequencies = _.sortBy(self.data.frequencies, function(cur){
			return -cur.val;
		});

		//Show top 10
		self.data.frequencies = self.data.frequencies.slice(0, 10);
	},
	draw: function(){
		var self = this;

		//Get the ID of the visual
		if (
			!self.options.props ||
			!self.options.props.get("wpid")
		){
			return;
		}

		//Get the container
		var visualId = self.options.props.get("wpid");
		self.container = $(".c-visual#" + visualId + " .c-visual__graphic");
		
		//Append the svg tag
		var svg = d3.select(self.container[0]);

		//Get pixel dimensions
		var dimensions = svg.node().getBoundingClientRect();
		var width = dimensions.width;
		var height = dimensions.height;

		//Set up the scales
		var margin = {top: 50, right: 30, bottom: 100, left: 60};
		var arr = _.map(self.data.frequencies, function (cur) { return cur.val; });
		var min = Math.min.apply( null, arr );
		var max = Math.max.apply( null, arr ) + 2;

		var keys = _.map(self.data.frequencies, function(cur){
			return cur.key;
		});
		var xRange = [];
		var minX = margin.left;
		var maxX = width - margin.right;
		var step = (maxX)/(keys.length+1);
		for (var i = minX; i < maxX; i+=step) {
			xRange.push(i);
		}

		var xScale = d3.scaleOrdinal()
			.domain(keys)
			.range(xRange);
		var yScale = d3.scaleLinear()
			.domain([0, max])
			.range([(height - margin.bottom), margin.top]);

		//Set up and draw the axes
		var xAxis = axis.axisBottom(xScale);

	    var yAxis = axis.axisLeft(yScale);

		svg.append("g")
			.attr("class", self.classPrefix+"__axis "+self.classPrefix+"__axis__y")
			.attr("transform", "translate(" + margin.left + ",0)")
			.call(yAxis);

		svg.append("g")
			.attr("class", self.classPrefix+"__axis "+self.classPrefix+"__axis__x")
			.attr("transform", "translate(0," + (height - margin.bottom) + ")")
			.call(xAxis);

		svg.selectAll("." + self.classPrefix + "__axis__x text")
			.attr("transform", function(d){
				return "translate(" + (step * 0.5) + ", 0)rotate(-30)";
			})
			.attr("text-anchor", "end")
			.html(function(d){
				var lines = d.split(" ");
				var str = "";
				if (lines.length === 1){
					str += "<tspan dy='1em' x='0'>" + lines[0] + "</tspan>";
				}else if (lines.length === 2){
					str += "<tspan dy='1em' x='0'>" + lines[0] + "</tspan>";
					str += "<tspan dy='1em' x='0'>" + lines[1] + "</tspan>";
				}else{
					str += "<tspan dy='1em' x='0'>" + lines[0] + "</tspan>";
					str += "<tspan dy='1em' x='0'>" + lines[1] + "...</tspan>";
				}
				return str;
			});

		svg.selectAll("." + self.classPrefix + "__axis text")
			.attr("class", self.classPrefix + "__axis-text");

		//Draw hover label
		var legend = svg.append("text")
        	.attr("class", self.classPrefix + "__legend")
            .attr("text-anchor", "end")  
            .attr("transform", "translate("+ (width - (margin.right + 10)) +","+(margin.top)+")")
            .text("Legend");

		//Draw chart bars
		var barContainer = svg.append("g")
			.attr("class", self.classPrefix + "__bars");

		var bars = barContainer.selectAll(self.classPrefix + "__bar")
			.data(self.data.frequencies)
			.enter().append("rect")
			.attr("class", self.classPrefix + "__bar")
			.attr("x", function(d){
				return xScale(d.key);
			})
			.attr("y", function(d){
				return yScale(d.val);
			})
			.attr("width", step)
			.attr("height", function(d){
				return yScale(0) - yScale(d.val);
			})
			.on("mouseover", function(d){
				var str = "";
				str += "<tspan dy='1.1em' x='0' class='" + self.classPrefix + "__legend-category'>" + d.key + "</tspan>";
				str += "<tspan dy='1.1em' x='0'>" + d.val + " companies</tspan>";
				legend.html(str)
					.attr("class", self.classPrefix + "__legend " + self.classPrefix + "__legend__show");
			})
			.on("mouseout", function(d){
				legend.attr("class", self.classPrefix + "__legend");
			});

		//Add titles to the axes
        svg.append("text")
        	.attr("class", self.classPrefix + "__axis-label")
            .attr("text-anchor", "middle")  
            .attr("transform", "translate("+ (margin.left/4) +","+(height/2)+")rotate(-90)")  
            .text(self.options.props.get("meta").misc['y-axis']);

        svg.append("text")
        	.attr("class", self.classPrefix + "__axis-label")
            .attr("text-anchor", "middle")  
            .attr("transform", "translate("+ (width/2) +","+(height - (margin.bottom / 6))+")")  
            .text(self.options.props.get("meta").misc['x-axis']);

        //Add title
        svg.append("text")
        	.attr("class", self.classPrefix + "__title")
            .attr("text-anchor", "middle")  
            .attr("transform", "translate("+ (width/2) +","+(margin.top / 2)+")")  
            .text(self.options.props.get("meta").misc.title);

		self.svg = svg;
	},
	showGraphic: function(){
		var self = this;

		self.container.addClass("c-visual__graphic__show");
	},
};

module.exports = function(component){
	component.histogram = histogram;
};