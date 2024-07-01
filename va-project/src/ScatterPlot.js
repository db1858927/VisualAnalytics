import React, { useState, useRef, useEffect } from 'react';
import * as d3 from "d3";

export default function ScatterPlot() {

  
  const data = useState([1.0 , 2.0 , 3.0]);
  const svgRef = useRef();

  

  //useEffect( () =>
  //csv('/data.csv').then(data => {
  //setData(data)
  //})
  //)

  //rerender data when change
  useEffect(() => {
    //setting up svg
    const width = 350;
    const height = 300;
    const margin = 50;
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('margin-top', 50)
      .style('overflow', 'visible')
      .style("fill", "EBEBEB");
    // Add the grey background that makes ggplot2 famous
    svg
      .append("rect")
      .attr("x",0)
      .attr("y",0)
      .attr("height", height)
      .attr("width", width);
     
      //Read the data
  d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/iris.csv").then(data => {

  // Add X axis
  var x = d3.scaleLinear()
    .domain([4*0.95, 8*1.001])
    .range([ 0, width ])
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickSize(-height).ticks(10))
    .select(".domain").remove()

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([-0.001, 9*1.01])
    .range([ height, 0])
    .nice()
  svg.append("g")
    .call(d3.axisLeft(y).tickSize(-width).ticks(7))
    .select(".domain").remove()

  // Customization
  svg.selectAll(".tick line").attr("stroke", "white")

  // Add X axis label:
  svg.append("text")
      .attr("text-anchor", "end")
      .attr("x", width/2 +50)
      .attr("y", height + 30  )
      .text("Sepal Length");

  // Y axis label:
  svg.append("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y",  -30)
      .attr("x",- height/2 + 50)
      .text("Petal Length")

  // Color scale: give me a specie name, I return a color
  var color = d3.scaleOrdinal()
  .domain(["setosa", "versicolor", "virginica" ])
  .range([ "#F8766D", "#00BA38", "#619CFF"])

  // Add dots
  svg.append('g')
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
      .attr("cx", function (d) { return x(d.Sepal_Length); } )
      .attr("cy", function (d) { return y(d.Petal_Length); } )
      .attr("r", 5)
      .style("fill", function (d) { return color(d.Species) } )

})

    

      

     

  },[])

  return (
    <div>
    <svg ref={svgRef}></svg>
    </div>
  )
}

