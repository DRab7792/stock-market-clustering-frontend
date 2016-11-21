var _ = require("underscore"),
	async = require("async"),
	d3 = require("d3"),
	moment = require("moment"),
	config = require('../../config'),
	d3Force = require('d3-force'),
	d3Drag = require('d3-drag');

var clusters = {
	classPrefix: "c-clusters",
	data: {
		clusters: [],
		k: 4,
		nodes: [],
		edges: [],
		totalDist: 0,
		maxDist: 0,
		colors: config.app.chartColors
	},
	initiate: function(options){
		var self = this;
		self.options = options || {};

		if (
			self.options.props && 
			self.options.props.get("meta") &&
			self.options.props.get("meta").data && 
			self.options.props.get("meta").data.k
		) self.data.k = self.options.props.get("meta").data.k;

		self.loadData(function(){
			self.prepareData();
			self.draw();
		});
	},
	loadData: function(callback){
		var self = this;
		var callbackIn = callback ? callback : function(){};

		self.options.actionHandler({
	    	controller: "data",
	    	method: "calcClusters",
	    }, {
	    	clusters: self.data.k 
	    }, function(err, res){
			if (err){
				return console.log("Error getting companies", err);
			}

			self.data.totalDist = res.distance;
			self.data.clusters = res.clusters;
			return callbackIn();
		});
	},
	prepareData: function(){
		var self = this, nodes = [], edges = [], maxDist = 0, clusterCenters = {};

		//Form nodes
		var n = 0;
		self.data.clusters.forEach(function(curCluster, clusterId){
			curCluster.models.forEach(function(cur, i){
				//Create the node
				var node = {
					name: cur.get("name"),
					cluster: clusterId,
					radius: 10,
					distance: cur.get("cluster").distFromCenter,
					center: cur.get("cluster").isCenter
				};
				nodes.push(node);

				//Mark the cluster center if applicable
				if (cur.get("cluster").isCenter){
					clusterCenters[clusterId] = n;
				}

				//Calc max distance
				if (cur.get("cluster").distFromCenter > maxDist){
					maxDist = cur.get("cluster").distFromCenter;
				}

				n++;
			});
		});

		//Form edges
		var edgeId = 0, nodeId = 0;
		self.data.clusters.forEach(function(curCluster, clusterId){
			var center = clusterCenters[clusterId];

			curCluster.models.forEach(function(cur){
				var nodeInfo = cur.get("cluster");

				if (nodeInfo.isCenter){
					nodeId++;
					return;
				}

				var adjDist = nodeInfo.distFromCenter,
					dash = 1;

				if (adjDist > 1000){
					adjDist = adjDist / 100;
					dash = 100;
				}else if (adjDist > 100){
					adjDist = adjDist / 10;
					dash = 10;
				}

				var edge = {
					id: "edge" + edgeId,
					source: nodeId,
					target: center,
					distance: adjDist,
					dash: dash
				};

				edges.push(edge);

				edgeId++;
				nodeId++;
			});
		});


		self.data.edges = edges;
		self.data.nodes = nodes;
		self.data.maxDist = maxDist;
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
		self.svg = d3.select(self.container[0]);

		//Get pixel dimensions
		var dimensions = self.svg.node().getBoundingClientRect();
		self.width = dimensions.width;
		self.height = dimensions.height;

		//Set up the margins
		self.margin = {top: 50, right: 150, bottom: 0, left: 80};

		//Setup cluster animation
		var clusters = self.svg.append("g")
			.attr("id", "clusters")
			.attr("transform", "translate(" + self.margin.left + ", " + self.margin.top + ")");

		self.drawClusters(clusters, [
			(self.width - self.margin.left - self.margin.right), 
			(self.height - self.margin.top - self.margin.bottom)
		]);

		//Draw the margins for the controls, title and legend
		self.svg.append("rect")
			.attr("class", self.classPrefix + "__margin")
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", self.margin.left)
			.attr("height", self.height)

		self.svg.append("rect")
			.attr("class", self.classPrefix + "__margin")
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", self.width)
			.attr("height", self.margin.top);

		self.svg.append("rect")
			.attr("class", self.classPrefix + "__margin")
			.attr("x", (self.width - self.margin.right))
			.attr("y", 0)
			.attr("width", self.margin.right)
			.attr("height", self.height);
		
		//Draw the legend
		self.drawLegend();

		//Draw the title
		self.svg.append("text")
        	.attr("class", self.classPrefix + "__title")
            .attr("text-anchor", "middle")  
            .attr("transform", "translate("+ (self.width/2) +","+(self.margin.top / 2)+")")  
            .text(self.options.props.get("meta").misc.title);

        //Group for info
        self.info = self.svg.append("g")
        	.attr("class", self.classPrefix + "__info");

	},
	drawLegend: function(){
		var self = this, start = 150;

		//Display total distance
		self.svg.append("text")
			.attr("class", self.classPrefix + "__legend")
			.attr("text-anchor", "middle")  
            .attr("transform", "translate("+ (self.width - (self.margin.right / 2)) +","+(self.height - start)+")")
            .html(function(){
            	var str = "";
            	str += "<tspan dy='1em' x='0'>Total Distance</tspan>";
            	str += "<tspan dy='1em' x='0'>" + self.data.totalDist.toFixed(2) + "</tspan>";
            	return str;
            });

        //Draw the legend for center nodes
        self.svg.append("circle")
        	.attr("cx", self.width - self.margin.right + 20)
        	.attr("cy", self.height - (start - 45))
        	.attr("r", 10)
        	.attr("class", self.classPrefix + "__legend-node");

        self.svg.append("text")
			.attr("class", self.classPrefix + "__legend")
			.attr("text-anchor", "start")  
            .attr("transform", "translate("+ (self.width - self.margin.right + 50) +","+(self.height - (start - 37))+")")
            .html(function(){
            	var str = "<tspan dy='1em' x='0'>Center of Cluster</tspan>";
            	// str += "<tspan dy='1em' x='0'>Total Distance</tspan>";
            	// str += "<tspan dy='1em' x='0'>" + self.data.totalDist.toFixed(2) + "</tspan>";
            	return str;
            });

        //Draw the legend for the edge styles
        var styles = {
        	"": "Distance x 1",
        	"__dash": "Distance x 100",
        	"__double-dash": "Distance x 1000"
        };
        var offset = 70;
        _.each(Object.keys(styles), function(classSuffix){
        	var curClass = self.classPrefix + "__edge" + classSuffix,
        		curLabel = styles[classSuffix];

        	if (curClass !== "") curClass += " " + self.classPrefix + "__edge";

        	//Append the line
        	self.svg.append("line")
        		.attr("x1", self.width - self.margin.right + 5)
        		.attr("x2", self.width - self.margin.right + 35)
        		.attr("y1", (self.height - (start - offset) + 8))
        		.attr("y2", (self.height - (start - offset) + 8))
        		.attr("class", curClass);

        	//Append the text
        	self.svg.append("text")
				.attr("class", self.classPrefix + "__legend")
				.attr("text-anchor", "start")  
	            .attr("transform", "translate(" + (self.width - self.margin.right + 50) + ","+(self.height - (start - offset))+")")
	            .html(function(){
	            	var str = "<tspan dy='1em' x='0'>" + curLabel + "</tspan>";
	            	return str;
	            });

        	offset += 20;
        });

	},
	drawClusters: function(container){
		var self = this;

		//Setup the layout
		self.force = d3Force.forceSimulation()
			.force("link", d3.forceLink().id(function(d) { return d.index }))
            .force("collide",d3.forceCollide( function(d){return d.radius + 8; }))
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(self.width / 2, self.height / 2))
            .force("y", d3.forceY(0))
            .force("x", d3.forceX(0));

		self.force.nodes(self.data.nodes);
		
		// force.gravity(0);	

		self.force.force("link")
			.links(self.data.edges)
			.strength(1)
			.distance(function(d){ return d.distance * 5; });

		//Draw the layout
		var edges = container.selectAll("." + self.classPrefix + "__edge")
			.data(self.data.edges)
			.enter().append("line")
			.attr("class", function(d){
				var classes = self.classPrefix + "__edge ";
				if (d.dash === 10) classes += self.classPrefix + "__edge__dash";
				if (d.dash === 100) classes += self.classPrefix + "__edge__double-dash";
				return classes;
			});

		var nodes = container.selectAll("." + self.classPrefix + "node")
			.data(self.data.nodes)
			.enter().append("g")
			.attr("class", function(d){ 
				var classes = self.classPrefix + "__node ";
				if (d.center) classes += self.classPrefix + "__node__center";
				return classes; 
			})
			.attr("fill", function(d){ 
				return config.app.chartColors[d.cluster]; 
			})
			.append("circle")
			.attr("r",function(d){ return d.radius;})
			.on("click", function(d){
				self.updateData(d);
			})
			.call(
				d3.drag()
					.on('start', self.dragstarted.bind(this) )
					.on('drag', self.dragged.bind(this) )
					.on('end', self.dragend.bind(this) )
			);

		self.force.on("tick", function() {
			edges.attr("x1", function(d) { return d.source.x; })
				.attr("y1", function(d) { return d.source.y; })
				.attr("x2", function(d) { return d.target.x; })
				.attr("y2", function(d) { return d.target.y; });

			nodes.attr("cx", function(d) { return d.x; })
				.attr("cy", function(d){ return d.y; });
		});
	},
	updateData: function(d){
		var self = this, offset = self.margin.top + 10;

		self.info.html("");

		self.info.append("text")
			.attr("class", self.classPrefix + "__info")
			.attr("text-anchor", "start")  
            .attr("transform", "translate(" + (self.width - self.margin.right + 10) + ","+(offset)+")")
			.attr("fill", self.data.colors[d.cluster])
            .html(function(){
            	var name = d.name.split(" "), str = "";
        		_.each(name, function(cur){
        			str += "<tspan dy='1em' x='0' class='" + self.classPrefix + "__info-company'>" + cur + "</tspan>";
        		});

            	str += "<tspan dy='2em' x='0'>Cluster " + d.cluster + "</tspan>";

            	str += "<tspan dy='2em' x='0'>Distance: " + d.distance.toFixed(2) + "</tspan>";
            	return str;
            });
	},
	dragstarted: function(d) {
        if (!d3.event.active) this.force.alphaTarget(0.1).restart();
        d.fx = d.x;
        d.fy = d.y;
    },
    dragged: function (d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    },
    dragend: function(d){
    	if (!d3.event.active) this.force.alphaTarget(0.1);
    	if (d.center){
    		d.fx = d.x;
        	d.fy = d.y;
    	}else{
    		d.fx = null;
        	d.fy = null;
    	}
    	
    }
};

module.exports = function(component){
	component.clusters = clusters;
};