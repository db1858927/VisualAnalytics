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
      const xScale = d3.scaleLinear()
      .domain([0, data.length - 1])
      .range([0, width]);
    const yScale = d3.scaleLinear()
      .domain([0, height])
      .range([height, 0]);
    const generateScaledLine = d3.line()
      .x((d, i) => xScale(i))
      .y(yScale)
      .curve(d3.curveCardinal);
    //setting the axes
    const xAxis = d3.axisBottom(xScale)
      .ticks(data.length)
      .tickFormat(i => i + 1)

    const yAxis = d3.axisLeft(yScale)
      .ticks(5);
    svg.append('g')
      .call(xAxis)
      .attr('transform', `translate(0, ${height})`);
    svg.append('g')
      .call(yAxis);


    svg.selectAll('dot')
      .data([data])
      .join('path')
      .attr('d', d => generateScaledLine(d))
      .attr('fill', 'none')
      .attr('stroke', 'black');
    

      

     

  },[data])

  return (
    <div>
    <svg ref={svgRef}></svg>
    </div>
  )
}

