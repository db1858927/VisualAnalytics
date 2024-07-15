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

    // Rimuovi tutti gli elementi precedenti dall'SVG
    svgElement.selectAll('*').remove();

    const svg = svgElement
      .append('svg')
      .attr('width', width + margin.left + margin.right + 100)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    d3.csv(`./tsne-results/Regions/tsne_results_${year}.csv`).then(data => {
      // Converti i dati
      data.forEach(d => {
        d['Component 1'] = +d['Component 1'];
        d['Component 2'] = +d['Component 2'];
      });

      // Supponendo che i tuoi dati abbiano una proprietà 'cluster' per il colore
      const clusters = Array.from(new Set(data.map(d => d.labels))).sort();
      const colorScale = d3.scaleOrdinal()
        .domain(clusters)
        .range(d3.schemeCategory10);  // Usa una scala di colori categorici

      // Definizione della scala per gli assi X e Y
      const xExtent = d3.extent(data, d => d['Component 1']);
      const yExtent = d3.extent(data, d => d['Component 2']);
      const xMargin = (xExtent[1] - xExtent[0]) * 0.05;
      const yMargin = (yExtent[1] - yExtent[0]) * 0.05;

      // Crea le scale
      const x = d3.scaleLinear()
        .domain([xExtent[0] - xMargin, xExtent[1] + xMargin])
        .range([0, width]);

      const y = d3.scaleLinear()
        .domain([yExtent[0] - yMargin, yExtent[1] + yMargin])
        .range([height, 0]);

      // Creazione degli assi X e Y
      const xAxis = d3.axisBottom(x);
      const yAxis = d3.axisLeft(y);

      // Aggiunta degli assi al grafico
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
        .attr("x", d => x(d['Component 1']) + 8)  // Spostamento orizzontale per evitare sovrapposizione con i punti
        .attr("y", d => y(d['Component 2']) + 2)
        .text(d => d['Regione'])
        .style("font-size", "12px")
        .style("fill", "white")
        .style("opacity", 0)  // Imposta l'opacità iniziale a 0 per nasconderle
        .attr("class", "label");

      // Creazione dello scatter plot
      svg.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", d => x(d['Component 1']))
        .attr("cy", d => y(d['Component 2']))
        .attr("r", 5)
        .style("fill", d => colorScale(d['labels']))
        .style("opacity", 0.8)
        .on("mouseover", function(event, d) {
          d3.select(this).transition().attr("r", 7);  // Opzionale: ingrandisci il punto
          const label = labels.filter(label => label['Regione'] === d['Regione']);
          label.transition().style("opacity", 0.8);
        })
        .on("mouseout", function(event, d) {
          d3.select(this).transition().attr("r", 5);  // Opzionale: riduci il punto
          labels.filter(label => label['Regione'] === d['Regione'])
            .transition()
            .style("opacity", 0);
        });

      const legendSvg = d3.select(legendRef.current);

      // Rimuovi tutti gli elementi presenti nella legenda prima di aggiungere quelli nuovi
      legendSvg.selectAll("*").remove();
      const legendWidth = 100;
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
        .attr("cx", 10 + size / 2) // centro del cerchio
        .attr("cy", (d, i) => 10 + (i + 1) * (size + 5) + size / 2) // centro del cerchio
        .attr("r", size / 2) // raggio del cerchio
        .style("fill", d => colorScale(d));

      legendSvg.selectAll("mylabels")
        .data(clusters)
        .enter()
        .append("text")
        .attr("x", 10 + size * 1.2)
        .attr("y", (d, i) => 10 + (i + 1) * (size + 5) + (size / 2))
        .style("fill", d => colorScale(d))
        .text(d => d)
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle");

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