
var margin = { top: 50, right: 0, bottom: 100, left: 0 };
var width = 1300;
var height = 700 - margin.top - margin.bottom;
var colours = ['#d73027','#fc8d59','#fee08b','#ffffbf','#d9ef8b','#91cf60','#1a9850'];

d3.json("housingchanges.json", function(error, data){
        dataset = data;
        createHeatTiles();
    });

function createHeatTiles(){

    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    var g = svg.append("g")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xScale = d3.scaleLinear()
        .domain(d3.extent(dataset, function(d){ return d.col; }))
        .range([0,width])
        .nice();
    var yScale = d3.scaleLinear()
        .domain(d3.extent(dataset, function(d){ return d.row; }))
        .range([60,0])
        .nice();

    var colorScale = d3.scaleQuantile()
        .domain([d3.min(dataset, function (d) { return d.pctchange; }),
            d3.max(dataset, function (d) { return d.pctchange; })])
        .range(colours);

    var tiles = g.selectAll(".tiles")
        .data(dataset)
        .enter()
        .append("svg:rect")
        .attr("class", "tiles")
        .attr("x", function(d){ return xScale(d.col)})
        .attr("y", function(d){ return yScale(d.row)})
        .attr("rx", 2)
        .attr("ry", 2)
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", function(d){ return colorScale(d.pctchange)})
        .on('mouseover', function(d, i){
            d3.select(this).style('stroke', 'black').style('stroke-width',2);
        })
        .on('mouseout', function(d, i) {
            d3.selectAll('.tiles').style('stroke','white');
        })
        .append("svg:title")
        .text(function(d) {return d.neighbourhood; });

    var colLegend = g.selectAll(".legend")
        .data(colorScale.quantiles(), function(d) { return d; })
        .enter().append("g");

    colLegend.append("rect")
        .attr("x", function(d, i) { return 150 + (((width * 2/3)/6) * i); })
        .attr("y", 100)
        .attr("width", ((width * 2/3)/6))
        .attr("height", 10)
        .style("fill", function(d, i) { return colours[i]; });
};
