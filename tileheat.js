
var margin = { top: 2, right: 0, bottom: 100, left: 100 };
var width = 300;
var height = 790 - margin.top - margin.bottom;
var colours = ['#d73027','#fc8d59','#fee08b','#ffffbf','#d9ef8b','#91cf60','#1a9850'];

d3.csv("housingchanges.csv", function(error, data){
        dataset = data;
        createHeatTiles();
    });

d3.json("chi.json",function(error, data){
        nMap = data.features;
    });

d3.csv("centroids.csv",function(error, data){
        centroids = data;
    });

var svg = d3.select("#chart")
    .append("svg")
    .attr("width", 300)
    .attr("height", height)
    .style("float","left");

function createHeatTiles(){
    var g = svg.append("g")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xScale = d3.scaleLinear()
        .domain(d3.extent(dataset, function(d){ return d.col; }))
        .range([0,85])
        .nice();
    var yScale = d3.scaleLinear()
        .domain(d3.extent(dataset, function(d){ return d.row; }))
        .range([0,100])
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
        .attr("width", 40)
        .attr("height", 10)
        .style("fill", function(d){ return colorScale(d.pctchange)})
        .on('mouseover', function(d){
            d3.select(this).style('stroke', 'black').style('stroke-width',2);
            highlightMap(d.neighbourhood);
        })
        .on('click', function(d) {
            zoomNMap(d.neighbourhood);
        })
        .on('mouseout', function(d) {
            d3.selectAll('.tiles').style('stroke','white');
        })
        .append("svg:title")
        .text(function(d) {return d.neighbourhood; });

    /*var colLegend = g.selectAll(".legend")
        .data(colorScale.quantiles(), function(d) { return d; })
        .enter().append("g");

    colLegend.append("rect")
        .attr("x", function(d, i) { return 150 + (((width * 2/3)/6) * i); })
        .attr("y", 100)
        .attr("width", ((width * 2/3)/6))
        .attr("height", 10)
        .style("fill", function(d, i) { return colours[i]; });*/
};

mapboxgl.accessToken = 'pk.eyJ1IjoieXV4aS13dSIsImEiOiJjamFrOXN6dTAyaHBrMnFvaXF3a3gwa3lzIn0.cnlEO-8mEol5nDREoHY96A';
var mapbig = new mapboxgl.Map({
    container: 'chart',
    style: 'mapbox://styles/mapbox/light-v9',
    center: [-87.6298,41.8781],
    zoom: 11
});

function getRegionCoords(region){
    for (n in nMap){
        if (nMap[n].properties.Name){
            if (nMap[n].properties.Name == region){
                return nMap[n].geometry.coordinates;
            };
        };
    };
};

function getRegionCentroid(region){
    for (c in centroids){
        if (centroids[c].region == region){
            var lat = parseFloat(centroids[c].lat),
                lng = parseFloat(centroids[c].lng);
            return [lng, lat];
        }
    };
};

function zoomNMap(region){
    var neighCent = getRegionCentroid(region);
    var neighGeo = getRegionCoords(region);
    console.log(neighCent);

    var map = new mapboxgl.Map({
        container: 'chart',
        style: 'mapbox://styles/mapbox/light-v9',
        center: Object.values(neighCent),
        zoom: 14
    });
    console.log(neighGeo);

    map.on('load', function () {
        map.addLayer({
            'id': region,
            'type': 'fill',
            'source': {
                'type': 'geojson',
                'data': {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Polygon',
                        'coordinates': neighGeo
                        }}},
                    'layout': {},
                    'paint': {
                        'fill-color': '#1E90FF',
                        'fill-opacity': 0.2
                        }
    })});

};

function highlightMap(region){
    var neighCent = getRegionCentroid(region);
    var neighGeo = getRegionCoords(region);
    console.log(neighCent);

    mapbig.on('load', function () {
        mapbig.addLayer({
            'id': region,
            'type': 'fill',
            'source': {
                'type': 'geojson',
                'data': {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Polygon',
                        'coordinates': neighGeo
                        }}},
                    'layout': {},
                    'paint': {
                        'fill-color': '#1E90FF',
                        'fill-opacity': 0.2
                        }
    })});
};
