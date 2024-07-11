import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const ScatterPlot = () => {
  const svgRef = useRef(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    // Margin convention
    const margin = { top: 10, right: 30, bottom: 30, left: 60 };
    const width = 400 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG element
    const svgElement = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    //Read the data
    d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/iris.csv").then(function (data) {

      // Add X axis
      const x = d3.scaleLinear()
        .domain([4, 8])
        .range([0, width]);
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

      // Add Y axis
      const y = d3.scaleLinear()
        .domain([0, 9])
        .range([height, 0]);
      svg.append("g")
        .call(d3.axisLeft(y));

      // Color scale: give me a specie name, I return a color
      const color = d3.scaleOrdinal()
        .domain(["setosa", "versicolor", "virginica"])
        .range(["#440154ff", "#21908dff", "#fde725ff"])


      // Highlight the specie that is hovered
      const highlight = function (d) {
        const selected_specie = d.Species;

        d3.selectAll(".dot")
          .transition()
          .duration(200)
          .style("fill", "lightgrey")
          .attr("r", 3);

        d3.selectAll("." + selected_specie)
          .transition()
          .duration(200)
          .style("fill", color(selected_specie))
          .attr("r", 7);
      };

      // Highlight the specie that is hovered
      const doNotHighlight = function () {
        d3.selectAll(".dot")
          .transition()
          .duration(200)
          .style("fill", function (d) { return color(d.Species); })
          .attr("r", 5);
      };

      // Add dots
      svg.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", function (d) { return "dot " + d.Species })
        .attr("cx", function (d) { return x(d.Sepal_Length); })
        .attr("cy", function (d) { return y(d.Petal_Length); })
        .attr("r", 5)
        .style("fill", function (d) { return color(d.Species) })
        .on("mouseover", highlight)
        .on("mouseleave", doNotHighlight)

    });


  }, []);

  return (
    <div>
      <svg ref={svgRef}></svg>
    </div>
  );
};


export default ScatterPlot;