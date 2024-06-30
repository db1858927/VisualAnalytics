import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const Map = () => {
  const svgRef = useRef();

  useEffect(() => {
    // Set the dimensions and margins of the graph
    var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// Map and projection
var projection = d3.geoNaturalEarth1()
    .scale(width / 1.3 / Math.PI)
    .translate([width / 2, height / 2])

// Load external data and boot
  d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(data => {

    // Draw the map
    svg.append("g")
        .selectAll("path")
        .data(data.features)
        .enter().append("path")
            .attr("fill", "#69b3a2")
            .attr("d", d3.geoPath()
                .projection(projection)
            )
            .style("stroke", "#fff")
})

  }, []);

  return (
    <svg id="my_dataviz" ref={svgRef} width={360} height={400}></svg>
  );
};

export default Map;