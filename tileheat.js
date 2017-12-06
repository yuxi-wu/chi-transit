
var margin = { top: 2, right: 0, bottom: 100, left: 100 };
var width = 300;
var height = 790 - margin.top - margin.bottom;
var colours = ['#d73027','#fc8d59','#fee08b','#ffffbf','#d9ef8b','#91cf60','#1a9850'];

d3.csv("data/housingchanges.csv", function(error, data){
        dataset = data;
        createHeatTiles();
    });

d3.json("data/chi.json",function(error, data){
        nMap = data.features;
    });

d3.csv("data/centroids.csv",function(error, data){
        centroids = data;
    });

d3.csv("data/divvy13.csv",function(error, data){
    divvy13 = data;
    var len = Object.keys(divvy13).length
    drawAllJourneys(13, len);
});

d3.csv("data/divvystations13.csv",function(error, data){
    stations13 = data;
});

d3.csv("data/divvy17Q1.csv",function(error, data){
    divvy171 = data;
    var len = Object.keys(divvy171).length
    console.log(len);
    drawAllJourneys(17, len);
});

d3.csv("data/divvy17Q2.csv",function(error, data){
    divvy172 = data;
});

d3.csv("data/divvystations17.csv",function(error, data){
    stations17 = data;
});

var svg = d3.select("#chart")
    .append("svg")
    .attr("width", 300)
    .attr("height", height)
    .style("float","left");

var mSvg = d3.select("#map")
    .append("svg")
    .attr("width", 700)
    .attr("height", height)
    .style("float","right");

var chiCent = [-87.6298,41.8781];
mapboxgl.accessToken = 'pk.eyJ1IjoieXV4aS13dSIsImEiOiJjamFrOXN6dTAyaHBrMnFvaXF3a3gwa3lzIn0.cnlEO-8mEol5nDREoHY96A';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v9',
    center: chiCent,
    zoom: 11
});

//CREATE TILE MENU
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
            //highlightMap(d.neighbourhood);
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


//PLOT DATA ON MAP
function lookupStation(stationID, year){
    if (year == 13){
        stations = stations13;
        }
    else if (year == 17) {
        stations = stations17;
    };

    return stations.filter(
      function(stations){ return stations.id == stationID; }
    );
};

function drawAllJourneys(year, numItems){
    if (year == 13){
        var journeys = divvy13;
        var colour = "blue";
        var sID = "Divvy 2013";
    }
    else if (year == 17) {
        var journeys = divvy171;
        var colour = "purple";
        var sID = "Divvy 2017";
    };

    var sample = journeys.slice(0,Math.floor(numItems/10));

    map.on("load", function(){
        if (!map.getSource(sID)){
        map.addSource(sID, {
            "type": "geojson",
            "data":{
                "type": "FeatureCollection",
                "features": gatherJourneys(sample, year)
            }
        });
        map.addLayer({
            "id": sID,
            "type": "line",
            "source": sID,
            "layout": {
                "line-join": "round",
                "line-cap": "butt"
                },
                "paint": {
                    "line-color": colour,
                    "line-width": 1,
                    "line-opacity": 0.05
            }
        });};
    });
};

function gatherJourneys(data, year){
    var paths = [];

    for (j in data){
        jStart = lookupStation(data[j].from_station_id, year)[0]
        jEnd = lookupStation(data[j].to_station_id, year)[0]

        var onePath = {
            "type":"Feature",
            "geometry":{
                "type": "LineString",
                "coordinates": [
                [parseFloat(jStart.longitude), parseFloat(jStart.latitude)],
                [parseFloat(jEnd.longitude), parseFloat(jEnd.latitude)]
                ]
            }
        };
        paths.push(onePath);
    };
    return paths;
};

//ZOOM/PAN TO NEIGHBOURHOOD
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

    var findRC = centroids.filter(function(centroids){
            return centroids.region == region; }
        )[0];
    console.log([parseFloat(findRC.lat), parseFloat(findRC.lng)]);

    return [parseFloat(findRC.lng), parseFloat(findRC.lat)];
};
/*
function drawNeighOutlines(){
    for (c in centroids){
        region = centroids[c].region;
        var neighGeo = getRegionCoords(region);
        map.addSource(region, {
            "type": "geojson",
            "data": {
                "type": "Feature",
                "geometry": {
                    'type': 'Polygon',
                    'coordinates': neighGeo
                }
            }
        });

        map.addLayer({'id': region,
                    'type': 'fill',
                    'source': region,
                    'layout': {},
                    'paint': {
                        'fill-color': 'red',
                        'fill-opacity': 0.2
                        }
            });
    };
};*/


var prevID;
function zoomNMap(region){
    try {
        map.removeSource(prevID);
        map.removeLayer(prevID);
    }
    catch(err) {
        //alert("Error!");
    };

    var neighCent = getRegionCentroid(region);
    var neighGeo = getRegionCoords(region);

    map.addSource(region, {
        "type": "geojson",
        "data": {
            "type": "Feature",
            "geometry": {
                'type': 'Polygon',
                'coordinates': neighGeo
            }
        }
    });

    map.addLayer({'id': region,
                'type': 'line',
                'source': region,
                'layout': {},
                'paint': {
                    'line-color': '#2F4F4F',
                    'line-opacity': 0.75,
                    'line-width': 8
                    }
        });

    map.jumpTo({ 'center': neighCent, 'zoom': 14 });
    prevID = region;
};

/*function highlightMap(region){
    var neighCent = getRegionCentroid(region);
    var neighGeo = getRegionCoords(region);
    console.log(neighCent);

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
};*/

var toggleableLayerIds = [ 'Divvy 2013', 'Divvy 2017' ];

for (var i = 0; i < toggleableLayerIds.length; i++) {
    var id = toggleableLayerIds[i];

    var link = document.createElement('a');
    link.href = '#';
    link.className = 'active';
    link.textContent = id;

    link.onclick = function (e) {
        var clickedLayer = this.textContent;
        e.preventDefault();
        e.stopPropagation();

        var visibility = map.getLayoutProperty(clickedLayer, 'visibility');

        if (visibility === 'visible') {
            map.setLayoutProperty(clickedLayer, 'visibility', 'none');
            this.className = '';
        } else {
            this.className = 'active';
            map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
        }
    };

    var layers = document.getElementById('menu');
    layers.appendChild(link);
}
