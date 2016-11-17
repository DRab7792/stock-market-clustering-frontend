var _ = require("underscore"),
	async = require("async"),
	d3 = require("d3"),
	moment = require("moment"),
	scale = require("d3-scale"),
	axis = require("d3-axis");

var stockPrices = {
	classPrefix: "c-stockPrices",
	data: {
		sectors: [],
		lines: [],
		maxPrice: 0,
		colors: ["#F15A5A", "#F0C419", "#4EBA6F", "#2D95BF", "#955BA5"],
		startDate: moment(),
		endDate: moment("1970-01-01", "YYYY-MM-DD")
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
		
		var lines = [], i = 0;
		
		//Get the frequencies of all the companies by category
		_.each(self.data.sectors, function(curSector){
			var curSectorLabel = curSector.models[0].get("category").sector;
			
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
				_.each(curComp.get("stockPrices").models, function(curPrice){
					var avg = curPrice.getAverage(),
						date = moment(curPrice.get("date"), "YYYY-MM-DD");

					var point = {
						date: date,
						price: avg
					};

					//Calculate the max price
					if (avg > self.data.maxPrice){
						self.data.maxPrice = avg;
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

				lines.push(curLine);
			});
			i++;
		});

		self.data.startDate.subtract(10, 'days');
		self.data.endDate.add(10, 'days');

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
		var container = $(".c-visual#" + visualId);
		
		//Append the svg tag
		var svg = d3.select(container[0])
			.append("svg")
			.attr("width", "100%")
			.attr("height", "100%");

		//Get pixel dimensions
		var dimensions = svg.node().getBoundingClientRect();
		var width = dimensions.width;
		var height = dimensions.height;

		//Set up the scales
		var margin = {top: 50, right: 60, bottom: 80, left: 60};

		var dates = self.data.lines[0].points.length;
		var minX = margin.left;
		var maxX = width - margin.right;

		console.log(self.data.startDate.format("YYYY-MM-DD"), self.data.endDate.format("YYYY-MM-DD"));
		var xScale = d3.scaleTime()
			.domain([self.data.startDate, self.data.endDate])
			.range([minX, maxX]);
		var yScale = d3.scaleLinear()
			.domain([0, self.data.maxPrice])
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

		_.each(self.data.lines, function(cur){

			var line = d3.line()
				.x(function(d){ 
					// var month = parseInt(d.date.format("MM")),
					// 	year = parseInt(d.date.format("YYYY")),
					// 	day = parseInt(d.date.format("DD"));
					var date = new Date(d.date.format());
					return xScale(date); 
				})
				.y(function(d){ return yScale(d.price); });

			lineContainer.append("path")
				.datum(cur.points)
				.attr("class", function(){
					var str = self.classPrefix + "__line ";
					return str;
				})
				.attr("d", line)
				.attr("stroke", function(d){
					console.log(cur.color);
					return cur.color;
				});
		});

		// var bars = lineContainer.selectAll(self.classPrefix + "__line")
		// 	.data(self.data.lines)
		// 	.enter().append("rect")
		// 	.attr("class", self.classPrefix + "__bar")
		// 	.attr("x", function(d){
		// 		return xScale(d.key);
		// 	})
		// 	.attr("y", function(d){
		// 		return yScale(d.val);
		// 	})
		// 	.attr("width", step)
		// 	.attr("height", function(d){
		// 		return yScale(0) - yScale(d.val);
		// 	})
		// 	.on("mouseover", function(d){
		// 		var str = "";
		// 		str += "<tspan dy='1.1em' x='0' class='" + self.classPrefix + "__legend-category'>" + d.key + "</tspan>";
		// 		str += "<tspan dy='1.1em' x='0'>" + d.val + " companies</tspan>";
		// 		legend.html(str)
		// 			.attr("class", self.classPrefix + "__legend " + self.classPrefix + "__legend__show");
		// 	})
		// 	.on("mouseout", function(d){
		// 		legend.attr("class", self.classPrefix + "__legend");
		// 	});

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
	}
};

module.exports = function(component){
	component.stockPrices = stockPrices;
};