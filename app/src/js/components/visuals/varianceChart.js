var _ = require("underscore"),
	async = require("async"),
	d3 = require("d3"),
	moment = require("moment"),
	config = require('../../config'),
	scale = require("d3-scale"),
	axis = require("d3-axis");

var varianceChart = {
	classPrefix: "c-variance",
	data: {
		sectors: [],
		lines: [],
		maxY: 0,
		minY: 1000,
		colors: ["#F15A5A", "#F0C419", "#4EBA6F", "#2D95BF", "#955BA5"],
		legend: [],
		startDate: moment(),
		endDate: moment("1970-01-01", "YYYY-MM-DD")
	},
	initiate: function(options){
		var self = this;
		self.options = options || {};

		self.loadData(function(){
			self.prepareData();
			self.draw();
			self.setupDefault();
		});
	},
	setupDefault: function(){
		var self = this;
		
		if (
			!self.options.props || 
			!self.options.props.get("meta") ||
			!self.options.props.get("meta").data || 
			!self.options.props.get("meta").data.defaults
		) return;

		//Get Defaults
		var defaults = self.options.props.get("meta").data.defaults;

		//Iterate through sectors
		self.data.sectors.forEach(function(cur, i){
			var curSectorLabel = cur.models[0].get("category").sector;

			//If the current sector is not in the defaults, fade them
			if (!_.contains(defaults, curSectorLabel)){
				self.legendClick(i);
			}
		});
	},
	loadData: function(callback){
		var self = this;
		
		if (
			!self.options.props || 
			!self.options.props.get("meta") ||
			!self.options.props.get("meta").data || 
			!self.options.props.get("meta").data.sectors
		) return;

		var sectors = self.options.props.get("meta").data.sectors;

		//Call the data controller	
		this.options.actionHandler({
	    	controller: "data",
	    	method: "getCompaniesBySectors",
	    }, {
	    	sectors: sectors 
	    }, function(err, res){
			if (err){
				return console.log("Error getting companies", err);
			}

			self.data.sectors = res;
			return callback();
		});
	},
	prepareData: function(){
		var self = this;
		
		var lines = [], i = 0, func = "average";

		if (
			self.options.props && 
			self.options.props.get("meta") &&
			self.options.props.get("meta").data && 
			self.options.props.get("meta").data.function
		) func = self.options.props.get("meta").data.function;
		
		//Get the frequencies of all the companies by category
		_.each(self.data.sectors, function(curSector){
			var curSectorLabel = curSector.models[0].get("category").sector;
			var sectorLines = [];
			
			//Iterate through the sector's companies
			_.each(curSector.models, function(curComp){
				var curLine = {
					sector: curSectorLabel,
					color: self.data.colors[i],
					points: []
				};

				if (!curComp.get("stockPrices")){
					return;
				}

				//Form lines
				curComp.get("stockPrices").models.forEach(function(curPrice, i){
					var yVal,
						date = curPrice.get("date");

					if (func === "average"){
						yVal = curPrice.get("average");
					}else if (func === "stdDeviation"){
						yVal = curPrice.get("stdDeviations");
					}else if (func === "smooth"){
						yVal = curPrice.get("smoothedStdDeviations");
						if (i < config.app.movingAvgWindow) return;
					}else{
						yVal = 0;
					}

					var point = {
						date: date,
						price: yVal
					};

					//Calculate the max y val
					if (yVal > self.data.maxY){
						self.data.maxY = yVal;
					}

					//Calculate the min y val
					if (yVal < self.data.minY){
						self.data.minY = yVal;
					}

					//Calculate the start date
					if (date.isBefore(self.data.startDate)){
						self.data.startDate = moment(date);
					}

					//Calculate the end date
					if (date.isAfter(self.data.endDate)){
						self.data.endDate = moment(date);
					}

					curLine.points.push(point);
				});

				sectorLines.push(curLine);
			});

			lines.push(sectorLines);
			i++;
		});

		self.data.startDate.subtract(10, 'days');
		self.data.endDate.add(10, 'days');

		//Form the legend data
		self.data.sectors.forEach(function(curSector, i){
			var curSectorLabel = curSector.models[0].get("category").sector;
			var color = self.data.colors[i];
			self.data.legend.push({
				color: color,
				label: curSectorLabel
			});
		});

		//Save lines
		self.data.lines = lines;
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
		var container = $(".c-visual#" + visualId + " .c-visual__graphic");
		
		//Append the svg tag
		var svg = d3.select(container[0]);

		//Get pixel dimensions
		var dimensions = svg.node().getBoundingClientRect();
		var width = dimensions.width;
		var height = dimensions.height;

		//Set up the scales
		var margin = {top: 50, right: 100, bottom: 80, left: 60};

		// console.log(self.data.lines);
		var dates = self.data.lines[0][0].points.length;
		var minX = margin.left;
		var maxX = width - margin.right;

		// console.log(self.data.startDate.format("YYYY-MM-DD"), self.data.endDate.format("YYYY-MM-DD"));
		var xScale = d3.scaleTime()
			.domain([self.data.startDate, self.data.endDate])
			.range([minX, maxX]);
		var yScale = d3.scaleLinear()
			.domain([self.data.minY, self.data.maxY])
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

		if (self.data.minY !== 0){
			svg.append("line")
				.attr("x1", function(){ return xScale(self.data.startDate) + 1; })
				.attr("x2", function(){ return xScale(self.data.endDate); })
				.attr("y1", function(){ return yScale(0); })
				.attr("y2", function(){ return yScale(0); })
				.attr("class", self.classPrefix+"__axis__x-zero");
		}

		svg.selectAll("." + self.classPrefix + "__axis__x text")
			.attr("transform", function(d){
				return "translate(-10,0)rotate(-30)";
			})
			.attr("text-anchor", "end")
			.html(function(d){
				var str = "";
				str += "<tspan dy='1em' x='0'>" + moment(d).format("MMMM") + "</tspan>";
				str += "<tspan dy='1em' x='0'>" + moment(d).format("YYYY") + "</tspan>";
				return str;
			});

		svg.selectAll("." + self.classPrefix + "__axis text")
			.attr("class", self.classPrefix + "__axis-text");

		

		//Draw chart lines
		var lineContainer = svg.append("g")
			.attr("class", self.classPrefix + "__lines");
			// .attr("transform", "translate(-" + margin.left + ",0)");

		var i = 0, lineNum = 0;
		_.each(self.data.lines, function(curGroup){

			var line = d3.line()
				.x(function(d){ 
					// var month = parseInt(d.date.format("MM")),
					// 	year = parseInt(d.date.format("YYYY")),
					// 	day = parseInt(d.date.format("DD"));
					var date = new Date(d.date.format());
					return xScale(date); 
				})
				.y(function(d){ return yScale(d.price); });

			var lineGroup = lineContainer.append("g")
				.attr("class", self.classPrefix + "__group")
				.attr("id", "group"+i);

			_.each(curGroup, function(cur){

				lineGroup.append("path")
					.datum(cur.points)
					.attr("class", function(){
						var str = self.classPrefix + "__line ";
						return str;
					})
					.attr("id", function(){ return "line" + lineNum; })
					.attr("d", line)
					.attr("stroke", function(d){
						return cur.color;
					})
					.on("mouseover", function(){
						self.lineHover.bind(this)();
					})
					.on("mouseout", function(){
						self.lineBlur.bind(this)();
					});

				lineNum++;
			});

			i++;
		});

		self.lines = lineContainer;

		//Add the legend
		var legendGap = 50;
		var legend = svg.append("g")
			.attr("class", self.classPrefix + "__legend");

		legend.selectAll("." + self.classPrefix + "__legend-color")
			.data(self.data.legend)
			.enter().append("rect")
			.attr("class", self.classPrefix + "__legend-color")
			.attr("x", (width - margin.right) + 5)
			.attr("y", function(d, i){
				return (margin.top + (i * legendGap));
			})
			.attr("width", 10)
			.attr("height", 10)
			.attr("fill", function(d){
				return d.color;
			})
			.attr("id", function(d, i){
				return "color" + i;
			})
			.on("click", function(d, i){
				self.legendClick(i);
			});

		legend.selectAll("." + self.classPrefix + "__legend-label")
			.data(self.data.legend)
			.enter().append("text")
			.attr("class", self.classPrefix + "__legend-label")
			.attr("transform", function(d, i){
				var offset = (d.label.indexOf(" ") === -1) ? -3 : -10;
				return "translate(" + ((width - margin.right) + 20) + ", " + (margin.top + (i * legendGap) + offset) + ")";
			})
			.html(function(d){
				var str = "";
				var lines = d.label.split(" ");
				str += "<tspan dy='1em' x='0'>" + lines[0] + "</tspan>";
				if (lines.length > 1) str += "<tspan dy='1em' x='0'>" + lines[1] + "</tspan>";
				return str;
			})
			.attr("id", function(d, i){
				return "label" + i;
			})
			.on("click", function(d, i){
				self.legendClick(i);
			});

		self.legend = legend;

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
	legendClick: function(index){
		var self = this;

		//Get all elements
		var lineGroup = self.svg.select("#group" + index),
			color = self.svg.select("#color" + index),
			label = self.svg.select("#label" + index);

		//Is the current state faded?
		var isFaded = lineGroup.classed(self.classPrefix + "__group__faded");

		//Toggle classes for all elements
		lineGroup.classed(self.classPrefix + "__group__faded", !isFaded);
		color.classed(self.classPrefix + "__legend-color__faded", !isFaded);
		label.classed(self.classPrefix + "__legend-label__faded", !isFaded);
	},
	lineHover: function(d, i){
		//Bold the line
		d3.select(this).classed(self.classPrefix + "__line__bold", true);
	},
	lineBlur: function(d, i){
		//Unbold the line
		d3.select(this).classed(self.classPrefix + "__line__bold", false);
	}
};

module.exports = function(component){
	component.varianceChart = varianceChart;
};