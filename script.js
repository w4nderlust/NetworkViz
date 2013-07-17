d3.json('data.json', function(data, error) {

    /*
    SVG
    */

    var svg = d3.select('#graph').html('')
        .append('svg')
        .attr('width', 900)
        .attr('height',700);

    /*
    Data
    */

console.log(data);

	var graph = data['graph'];
    var clusters = data['clusters'];
    var colors = d3.scale.category10();
    var degree_distribution = data['degree_distribution'];
    var degree = data['degree'];
    var top10 = data['top10'];
    var cluster_counts = data['cluster_counts'];

    //console.log(degree_distribution);
    var extent_degree = d3.extent(degree_distribution, function(d) {
		return parseInt(d[0]);
	});
    //console.log(extent_degree);
	var extent_counts_degree = d3.extent(degree_distribution, function(d) {
		return parseInt(d[1]);
	});
    //console.log(extent_counts_degree);
    var dd_mapR = d3.scale.linear()
                        .domain(extent_degree)
                        .range([5,10])

	var dd_mapX = d3.scale.linear()
						.domain(extent_degree)
						.range([50, 250]);

	var dd_mapY = d3.scale.linear()
						.domain(extent_counts_degree)
						.range([650, 450]); 
    //console.log(top10)
    var extent_top10 = d3.extent(top10, function(d) {
		return parseInt(d[1]);
	});

    var top10_mapX = d3.scale.linear()
						.domain(extent_top10)
						.range([50, 150]);

    /*
    Graph
    */

    // Create a force layout to display nodes.
    var force = d3.layout.force()
        .gravity(0.1) //default 0.1
        .distance(40) //deafult 20
        .charge(-40) //default -30
        .nodes(graph.nodes)
        .links(graph.links)
        .size([900, 400]);


    // Add the edges to the SVG.
    var edge = svg.selectAll('line.edge')
        .data(graph.links)
        .enter().append('line')
        .attr('class', 'edge');
        //.style('stroke', 'rgba(200, 200, 200, 0.2)')
        //.style('stroke-width', 2.0);

    // Add the nodes to the SVG.
    var node = svg.selectAll(".node")
        .data(graph.nodes)
        .enter()
            .append("g")
            .attr("class", "node");
          //.call(force.drag);

    node.append("circle")
        .attr("r", function(d) {
            return dd_mapR(degree[d.id]);
        })
        .style('stroke', 'white')
        .style("fill", function(d) {
            return colors(clusters[d.id]);
        });

    node.append("text")
        .attr('class', '.text')
        .attr('id', function(d) { return d.id; })
        .attr("dx", 12)
        .attr("dy", ".35em")
        .text(function(d) { return d.name; })
        .style('opacity', 0);

    /*
    Graph Layout animation
    */

    force.on('tick', function() {
            node.attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            });

            edge.attr('x1', function(d) { return d.source.x; })
                .attr('y1', function(d) { return d.source.y; })
                .attr('x2', function(d) { return d.target.x; })
                .attr('y2', function(d) { return d.target.y; });
    });

    var force_is_working = true;
    force.start();

    /*
    Graph Interaction
    */

    node.on('mouseover', function () {
            d3.select(this).select('text')
                            .transition()
            	            .duration(200)
                            .style('opacity', 1);
        });

    node.on('mouseout', function () {
            d3.select(this).select('text')
                            .transition()
            	            .duration(200)
                            .style('opacity', 0);
        });

     /*
    Start/Stop Graph
    */

    var button = svg.append('g').attr('transform', 'translate(800, 380)')

    button.append('rect')
            .attr('height', 20)
            .attr('width', 80)
            .style('fill', '#ccc');

    button.append('text')
        .text('Stop Graph')
        .attr('y', 14)
        .attr('x', 40)
        .style('fill', '#333')
        .style('font-family', 'Arial')
        .style('font-size', '13px')
        .style('text-anchor', 'middle');

    button.on('mouseover', function () {
            d3.select(this).select('rect')
                            .transition()
            	            .duration(100)
                            .style('fill', '#ddd');
        });

    button.on('mouseout', function () {
            d3.select(this).select('rect')
                            .transition()
            	            .duration(200)
                            .style('fill', '#ccc');
        });

    button.on('click', function () {
            if (force_is_working) {
                force.stop();
                force_is_working = false;
                d3.select(this).select('text')
                            .transition()
            	            .duration(200)
                            .text('Move Graph');
            } else {
                force.start();
                force_is_working = true;
                d3.select(this).select('text')
                            .transition()
            	            .duration(200)
                            .text('Stop Graph');
            }
        });

    /*
    Title
    */

    svg.append('text')
        .text('Facebook Friend Graph')
        .attr('y', 20)
        .style('fill', '#333')
        .style('font-family', 'Arial')
        .style('font-size', '14px')
        .style('text-transform', 'uppercase');


    /*
    Footer Background
    */

    svg.append("rect")
        .attr("x", 0)
        .attr("y", 400)
        .attr("height", 300)
        .attr("width", 900)
        .style("fill", 'white');


    /*
    Degree distribution
    */

    var line = d3.svg.line()
                    .x(function (d) {
                        return dd_mapX(d[0]);
                    })
                    .y(function (d) {
                        return dd_mapY(d[1]);
                    })
                    .interpolate('basis');

    svg.append('path')
				.attr('d', line(degree_distribution))
                .attr('fill', 'none')
				.style('stroke-width', 0)
				.style('stroke', colors(7))
                .transition()
				.duration(2000)
                .style('stroke-width', 2);

    svg.append('line')
				.attr('x1', 50)
				.attr('y1', 650)
				.attr('x2', 50)
				.attr('y2', 450)
				.style('stroke-width', 1)
				.style('stroke', 'grey');

	svg.append('line')
				.attr('x1', 50)
				.attr('y1', 650)
				.attr('x2', 250)
				.attr('y2', 650)
				.style('stroke-width', 1)
				.style('stroke', 'grey');

    for (var xVal = extent_degree[0]; xVal <= extent_degree[1]; xVal = xVal + 25) {
        svg.append('line')
					.attr('x1', dd_mapX(xVal))
					.attr('y1', 650)
					.attr('x2', dd_mapX(xVal))
					.attr('y2', 655)
					.style('stroke-width', 1)
					.style('stroke', 'grey');

        svg.append('text')
            .text(xVal + '')
            .style('text-anchor', 'middle')
            .style('font-size', '10px')
            .style('fill', 'grey')
            .attr('x', dd_mapX(xVal))
            .attr('y', 665);
    }

    svg.append('text')
            .text('Degree')
            .style('text-anchor', 'middle')
            .style('font-size', '10px')
            .style('fill', 'grey')
            .attr('x', 150)
            .attr('y', 680);

    for (var yVal = extent_counts_degree[0]; yVal <= extent_counts_degree[1]; yVal = yVal + 2) {
        svg.append('line')
					.attr('x1', 45)
					.attr('y1', dd_mapY(yVal))
					.attr('x2', 50)
					.attr('y2', dd_mapY(yVal))
					.style('stroke-width', 1)
					.style('stroke', 'grey');

        svg.append('text')
            .text(yVal + '')
            .style('text-anchor', 'end')
            .style('font-size', '10px')
            .style('fill', 'grey')
            .attr('x', 35)
            .attr('y', dd_mapY(yVal));
    }

    svg.append('text')
            .text('Count')
            .style('text-anchor', 'middle')
            .style('writing-mode', 'tb')
            .style('font-size', '10px')
            .style('fill', 'grey')
            .attr('x', 15)
            .attr('y', 550);


    /*
    Top 10
    */
    //console.log(top10);
    var groups = svg.selectAll('.top10')
				.data(top10)
				.enter()
				.append('g')
				.attr('transform', function(d, i){
					//d is the single adta object in the array (dataset)
					//i is the index of the d object
					return 'translate(350, ' + (450 + (i*20)) + ')';
				});

			groups.append('rect')
				.attr('width', 0)
				.attr('height', 0)
				.attr('fill', function(d) {
                    return colors(clusters[d[1][1]]);
                })

				.transition()
				.duration(800)
				.delay(function(d, i) {
					return (i*100) + 100;
				})

				.attr('width', function(d){
					//d is the single adta object in the array (dataset)
					return top10_mapX(d[1][0]);
				})
				.attr('height', 15)
				.attr('fill', 'grey');

			groups.append('text')
                .attr('class', 'name')
				.text(function(d){
					//d is the single adta object in the array (dataset)
					return d[0];
				})
				.attr('y', 12)
				.attr('x', function(d){
					//d is the single adta object in the array (dataset)
					return top10_mapX(d[1][0]) + 4;
				})
				.style('font-size', '12px')
				.attr('fill', function(d) {
                    return colors(clusters[d[1][1]]);
                })
                .style('opacity', 0)

                .transition()
				.duration(800)
				.delay(function(d, i) {
					return (i*100) + 200;
				})

                .style('opacity', 1)
                .style('fill', 'grey');

        groups.append('text')
                .attr('class', 'number')
				.text(function(d){
					//d is the single adta object in the array (dataset)
					return d[1][0] + '';
				})
				.attr('y', 12)
				.attr('x', function(d){
					//d is the single adta object in the array (dataset)
					return top10_mapX(d[1][0]) - 4;
				})
				.style('font-size', '12px')
				.style('text-anchor', 'end')
				.attr('fill', 'white')
                .style('opacity', 0)

                .transition()
				.duration(800)
				.delay(function(d, i) {
					return (i*100) + 200;
				})

                .style('opacity', 1);

		groups.on('mouseover', function() {
					d3.select(this).select('rect')
						.transition()
                        .duration(200)
						.style('fill', function(d) {
                            return colors(clusters[d[1][1]]);
                        });

					d3.select(this).select('text.name')
						.transition()
                        .duration(200)
						.style('fill', function(d) {
                            return colors(clusters[d[1][1]]);
                        });
				});

		groups.on('mouseout', function() {
					d3.select(this).select('rect')
						.transition()
                        .duration(200)
						.style('fill', 'grey');

					d3.select(this).select('text.name')
						.transition()
                        .duration(200)
						.style('fill', 'grey');
				});

    /*
    Cluster Pie
    */
    var arc = d3.svg.arc().innerRadius(70).outerRadius(100);

    var pie = d3.layout.pie().value(function (d) {
        return d[1];
    });

    var ring = svg.append('g')
     				.attr('transform', 'translate(750,550)');

    var slices = ring.selectAll('.slice')
       	.data(pie(cluster_counts))
       	.enter()
            .append('g');


         slices
       		.append('path')
            .attr('class', 'slice')
       		.attr('d', arc)
            .style('fill', 'grey')
            .style('opacity', 0)

            .transition()
			.duration(800)
			.delay(function(d, i) {
				return (i * 200) + 100;
			})

            .style('fill', function(d) {
               return colors(d.data[0]);
            })
            .style('opacity', 1);

    slices.append('text')
        .attr('class', 'counts')
        .attr('x', 0)
        .attr('y', 0)
        .attr('dy', 12)
        .style('text-anchor', 'middle')
        .style('font-size', '36px')
        .style('opacity', 0);

        slices.on('mouseover', function(){
					d3.select(this).select('.counts')
                        .style('fill', function(d) {
                            return colors(d.data[0]);
                        })
                        .text(function(d) {
                            return d.data[1]+ '';
                        })
						.transition()
                        .duration(300)
                        .style('opacity', 1);
				});

        slices.on('mouseout', function () {
					d3.select(this).select('.counts')
						.transition()
            	        .duration(300)
                        .style('opacity', 0);
				});

});

