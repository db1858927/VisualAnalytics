import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const ScatterPlot = ({ year }) => {
  const svgRef = useRef();
  const legendRef = useRef();


  useEffect(() => {
    const margin = { top: 10, right: 30, bottom: 40, left: 50 };
    const width = 400 - margin.left - margin.right;
    const height = 320 - margin.top - margin.bottom;

    const svgElement = d3.select(svgRef.current);

    svgElement.selectAll('*').remove();

    const svg = svgElement
      .append('svg')
      .attr('width', width + margin.left + margin.right + 100)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    d3.csv(`./tsne-results/Regions/tsne_results_${year}.csv`).then(data => {
     
      data.forEach(d => {
        d['Component 1'] = +d['Component 1'];
        d['Component 2'] = +d['Component 2'];
      });

    
      const clusters = Array.from(new Set(data.map(d => d.labels))).sort();
      const colorScale = d3.scaleOrdinal()
        .domain(clusters)
        .range([ "#F8766D", "#00BA38", "#619CFF"])

      
      const xExtent = d3.extent(data, d => d['Component 1']);
      const yExtent = d3.extent(data, d => d['Component 2']);
      const xMargin = (xExtent[1] - xExtent[0]) * 0.05;
      const yMargin = (yExtent[1] - yExtent[0]) * 0.05;

      
      const x = d3.scaleLinear()
        .domain([xExtent[0] - xMargin, xExtent[1] + xMargin])
        .range([0, width]);

      const y = d3.scaleLinear()
        .domain([yExtent[0] - yMargin, yExtent[1] + yMargin])
        .range([height, 0]);

      
      const xAxis = d3.axisBottom(x);
      const yAxis = d3.axisLeft(y);

      
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

      svg.append("g")
        .call(yAxis);

      svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -32)
        .attr("x", -height / 2 + 60)
        .text(`TSNE-Component 2`)
        .attr("fill", "white")
        .style("font-size", "10px");

      svg.append("text")
        .attr("text-anchor", "end")
        .attr("y", height + 35)
        .attr("x", width / 2 + 60)
        .text(`TSNE-Component 1`)
        .attr("fill", "white")
        .style("font-size", "10px");

      const labels = svg.selectAll("text.label")
        .data(data)
        .enter().append("text")
        .attr("x", d => x(d['Component 1']) + 8)  
        .attr("y", d => y(d['Component 2']) + 2)
        .text(d => d['Regione'])
        .style("font-size", "12px")
        .style("fill", "white")
        .style("opacity", 0)  
        .attr("class", "label");



      svg.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", d => x(d['Component 1']))
        .attr("cy", d => y(d['Component 2']))
        .attr("r", 5)
        .style("fill", d => colorScale(d['labels']))
        .style("opacity", 0.8)
        .on("mouseover", function (event, d) {
          d3.select(this).transition().attr("r", 7);  
          const label = labels.filter(label => label['Regione'] === d['Regione']);

          label.transition().style("opacity", 0.8);
          console.log(d['labels'])


        })
        .on("mouseout", function (event, d) {
          d3.select(this).transition().attr("r", 5);  
          labels.filter(label => label['Regione'] === d['Regione'])
            .transition()
            .style("opacity", 0);


        });






      const legendSvg = d3.select(legendRef.current);

     
      legendSvg.selectAll("*").remove();
      const legendWidth = 150;
      const legendHeight = 80;

      legendSvg
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("position", "absolute")
        .style("bottom", "260px")
        .style("right", "40px")
        .style("padding", "5px")
        .style("border-radius", "5px")
        .style("box-shadow", "0 0 10px rgba(0,0,0,0.2)");

      const size = 10;

      legendSvg.selectAll("mydots")
        .data(clusters)
        .enter()
        .append("circle")
        .attr("cx", 10 + size / 2) 
        .attr("cy", (d, i) => 10 + (i + 1) * (size + 5) + size / 2) 
        .attr("r", size / 2) 
        .style("fill", d => colorScale(d));

      legendSvg.selectAll("mylabels")
        .data(clusters)
        .enter()
        .append("text")
        .attr("x", 10 + size * 1.2)
        .attr("y", (d, i) => 10 + (i + 1) * (size + 5) + (size / 2))
        .style("fill", d => colorScale(d))
        .text(function (d) {
          
          if (year === '2010') {
            if(d == 1 ) return "High level of pm2.5";
            if(d == 0 ) return "Low level of pm2.5";
            if(d == 2 ) return "Mid level of pm2.5";
          } if (year === '2011') {
            if(d == 1 ) return "High level of pm2.5";
            if(d == 0 ) return "Low level of pm2.5";
            if(d == 2 ) return "Mid level of pm2.5";
          } if (year === '2012') {
            if(d == 1 ) return "Low level of pm2.5";
            if(d == 0 ) return "Mid level of pm2.5";
            if(d == 2 ) return "High level of pm2.5";
          } if (year === '2013') {
            if(d == 1 ) return "High level of pm2.5";
            if(d == 0 ) return "Mid level of pm2.5";
            if(d == 2 ) return "Low level of pm2.5";
          } if (year === '2014') {
            if(d == 1 ) return "High level of pm2.5";
            if(d == 0 ) return "Low level of pm2.5";
            if(d == 2 ) return "Mid level of pm2.5";
          } if (year === '2015') {
            if(d == 1 ) return "High level of pm2.5";
            if(d == 0 ) return "Low level of pm2.5";
            if(d == 2 ) return "Mid level of pm2.5";
          } if (year === '2016') {
            if(d == 1 ) return "High level of pm2.5";
            if(d == 0 ) return "Low level of pm2.5";
            if(d == 2 ) return "Mid level of pm2.5";
          } if (year === '2017') {
            if(d == 1 ) return "High level of pm2.5";
            if(d == 0 ) return "Low level of pm2.5";
            if(d == 2 ) return "Mid level of pm2.5";
          } if (year === '2018') {
            if(d == 1 ) return "High level of pm2.5";
            if(d == 0 ) return "Low level of pm2.5";
            if(d == 2 ) return "Mid level of pm2.5";
          } if (year === '2019') {
            if(d == 1 ) return "High level of pm2.5";
            if(d == 0 ) return "Low level of pm2.5";
            if(d == 2 ) return "Mid level of pm2.5";
          } if (year === '2012') {
            if(d == 1 ) return "High level of pm2.5";
            if(d == 0 ) return "Low level of pm2.5";
            if(d == 2 ) return "Mid level of pm2.5";
          } if (year === '2021') {
            if(d == 1 ) return "High level of pm2.5";
            if(d == 0 ) return "Low level of pm2.5";
            if(d == 2 ) return "Mid level of pm2.5";
          } if (year === '2022') {
            if(d == 1 ) return "High level of pm2.5";
            if(d == 0 ) return "Low level of pm2.5";
            if(d == 2 ) return "Mid level of pm2.5";
          } 
        })
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .style("font-size", "10px");;

      legendSvg.append("text")
        .attr("x", 10)
        .attr("y", 15)
        .text('Clusters')
        .attr("fill", "white")
        .style("font-size", "12px");
    }).catch(error => {
      console.error("Error loading the data:", error);
    });
  }, [year]);

  return (
    <div>
      <svg ref={svgRef} style={{ display: 'flex', top: 0, left: 0, height: '350px', width: '400px', overflow: 'visible' }}></svg>

      <svg ref={legendRef} style={{ position: 'absolute', bottom: '20px' }}></svg>
    </div>
  );
};

export default ScatterPlot;