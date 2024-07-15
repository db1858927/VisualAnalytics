import React, { useRef, useEffect,useState } from 'react';
import * as d3 from 'd3';
import './App.css';

const BoxPlot = ({ selectedRegion, allData, setSelectedRegion, pollutant}) => {
    const svgRef = useRef();
    const tooltipRef = useRef();
    const legendRef = useRef();
    
    

    useEffect(() => {

        
        if (pollutant === '_total') {
            return;
        }
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const regionNameMapping = {
            "Valle d'Aosta/Vallée d'Aoste": "Valle d'Aosta",
            "Trentino-Alto Adige/Südtirol": "Trentino-Alto Adige",
            "Friuli-Venezia Giulia": "Friuli Venezia Giulia"
        };
    
        const getRegionName = (name) => {
            return regionNameMapping[name] || name;
        };


        
        const tooltip = d3.select(tooltipRef.current);

        const data = (selectedRegion ) ? allData.filter(d => getRegionName(d.Regione) === (selectedRegion )) : allData;


        const margin = { top: 10, right: 40, bottom: 60, left: 50 };
        const width = 540 - margin.left - margin.right;
        const height = 350 - margin.top - margin.bottom;

        const svgElement = svg
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const groups = (selectedRegion ) ? Array.from(new Set(data.map(d => d.Provincia))) : Array.from(new Set(data.map(d => d.Regione)));
        const groupData = new Map();

        groups.forEach(group => {
            const region = group
            const values = data.filter(d => ((selectedRegion ) ? d.Provincia : d.Regione) === group).map(d => +d.media_yy);
            values.sort(d3.ascending);
            const q1 = d3.quantile(values, 0.25);
            const median = d3.quantile(values, 0.5);
            const q3 = d3.quantile(values, 0.75);
            const interQuantileRange = q3 - q1;
            const min = Math.max(d3.min(values), q1 - 1.5 * interQuantileRange);
            const max = Math.min(d3.max(values), q3 + 1.5 * interQuantileRange);
            const mean = d3.mean(values) ? d3.mean(values).toFixed(2) : '0';
            const outliers = values.length > 1 ? values.filter(v => v < min || v > max) : [];
            groupData.set(group, { q1, median, q3, interQuantileRange, min, max, mean, values, outliers, region });
        });

        const allValues = data.map(d => +d.media_yy);

        const maxDataValue = d3.max(allValues);
        const minDataValue = d3.min(allValues)
        const maxDomain = Math.max(maxDataValue, 40);

        const y = d3.scaleLinear()
            .domain([minDataValue -5, maxDataValue +5])
            .range([height, 0]);

        svgElement.append('g')
            .call(d3.axisLeft(y));

        svgElement.append("text")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("y", -32)
            .attr("x", -height / 2 + 60)
            .text(`Concentration of ${pollutant.replace('_', '')} ${selectedRegion ? `of ${selectedRegion} (µg/m³)` : ''}`)
            .attr("fill", "white")
            .style("font-size", "10px");

        const x = d3.scaleBand()
            .domain(groups)
            .range([0, width])
            .paddingInner(1)
            .paddingOuter(.5);

        svgElement.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "rotate(-30)")
            .style("text-anchor", "end");

        const boxWidth = (selectedRegion    ) ? 25 : 17;

        

        groups.forEach(group => {
            const { q1, median, q3, min, max, mean, outliers,region } = groupData.get(group);
            const center = x(group) + x.bandwidth() / 2;
            
            svgElement.append("line")
                .attr("x1", center)
                .attr("x2", center)
                .attr("y1", y(min))
                .attr("y2", y(max))
                .attr("stroke", "white");

            const box = svgElement.append("rect")
                .attr("x", center - boxWidth / 2)
                .attr("y", y(q3))
                .attr("height", y(q1) - y(q3))
                .attr("width", boxWidth)
                .attr("stroke", "white")
                .style("opacity", 0.7)
                .style("fill", "currentColor");

            [min, median, max].forEach(val => {
                svgElement.append("line")
                    .attr("x1", center - boxWidth / 2)
                    .attr("x2", center + boxWidth / 2)
                    .attr("y1", y(val))
                    .attr("y2", y(val))
                    .attr("stroke", "white");
            });



            // Add mean
            const meanplus = svgElement.append("text")
                .attr("x", center)
                .attr("y", y(mean))
                .attr("dy", ".35em")
                .attr("text-anchor", "middle")
                .style("font-size", "10px")
                .style("fill", "white")
                .text("+");

            if (outliers.length > 0) {
                svgElement.selectAll(null)
                    .data(outliers)
                    .enter()
                    .append("circle")
                    .attr("cx", center)
                    .attr("cy", d => y(d))
                    .attr("r", 3)
                    .style("fill", "none")
                    .attr("stroke", "white");
            }
            if (pollutant == '_pm10'){
                svgElement.append("line")
                    .attr("x1", 0)
                    .attr("x2", width)
                    .attr("y1", y(40))
                    .attr("y2", y(40))
                    .attr("stroke", "red")
                    .attr("stroke-dasharray", "5,5");
            }
            else if (pollutant == '_pm25'){
                svgElement.append("line")
                    .attr("x1", 0)
                    .attr("x2", width)
                    .attr("y1", y(20))
                    .attr("y2", y(20))
                    .attr("stroke", "red")
                    .attr("stroke-dasharray", "5,5");

            }else if (pollutant == '_no2'){
                svgElement.append("line")
                    .attr("x1", 0)
                    .attr("x2", width)
                    .attr("y1", y(90))
                    .attr("y2", y(90))
                    .attr("stroke", "red")
                    .attr("stroke-dasharray", "5,5");
            }else if (pollutant == '_o3'){
                svgElement.append("line")
                    .attr("x1", 0)
                    .attr("x2", width)
                    .attr("y1", y(100))
                    .attr("y2", y(100))
                    .attr("stroke", "red")
                    .attr("stroke-dasharray", "5,5");
            }
            
            else {
                // Gestione di un caso non previsto, se necessario
                console.log("Pollutant not recognized:", pollutant);
              }

            // Mouse events
            // Gestione dell'evento mouseover e mouseout

            let tooltipText = `<b>${region}</b> <br>Median: ${median}<br>Mean: ${mean}<br>Min: ${min}<br>Max: ${max}`;

                    if (outliers.length > 0) {
                    
                        tooltipText += `<br>Outliers: ${outliers}`;
                    }

            box.on("mouseover", function (event) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("stroke", "black")
                    .style("opacity", 1);
                    
                const { pageX, pageY } = event;
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(tooltipText)
                    .style("left", `${pageX}px`)
                    .style("top", `${pageY - 150}px`)
                    .style("text-align", "right");
                    ;
            })
                .on("mouseout", function (event) {
                    d3.select(this)
                    .transition()
                    .duration(200)
                    .style("opacity", .7)
                    .attr("stroke", "white");

                    tooltip.transition().duration(500).style("opacity", 0);
                })
                .on("click", function () {
                    
                    setSelectedRegion(region);
                });

                meanplus.on("mouseover", function (event) {
                        
                    const { pageX, pageY } = event;
                    tooltip.transition().duration(200).style("opacity", .9);
                    tooltip.html(tooltipText)
                        .style("left", `${pageX}px`)
                        .style("top", `${pageY - 150}px`)
                        .style("text-align", "right");
                        ;
                })
                    .on("mouseout", function (event) {
        
                        tooltip.transition().duration(500).style("opacity", 0);
                    })
        });
        



        if (data.length === 0) {
            const y = d3.scaleLinear()
                .domain([0, 50])
                .range([height, 0]);

            svgElement.append('g')
                .call(d3.axisLeft(y));

            svgElement.append('g')
                .attr('transform', `translate(0,${height})`)
                .call(d3.axisBottom(x))
                .selectAll("text")
                .attr("transform", "rotate(-45)")
                .style("text-anchor", "end");


        }


        const createLegend = () => {
            const legendWidth = 100;
            const legendHeight = 120;

            const legendSvg = d3.select(legendRef.current)
                .attr("width", legendWidth)
                .attr("height", legendHeight)
                .style("position", "absolute")
                .style("bottom", "10px")
                .style("right", "10px")
                .style("padding", "5px")
                .style("border-radius", "5px")
                .style("box-shadow", "0 0 10px rgba(0,0,0,0.2)");

            const size = 10;

            // Dati per la leggenda: threshold, media, outliers
            const legendData = [
                { label: "Threshold", symbol: "line", strokeDasharray: "5,5", color: "red" },
                { label: "Mean", symbol: "+", color: "white" },
                { label: "Outliers", symbol: "circle", radius: 3, color: "white", fill: "none" }
            ];

            // Aggiungi i vari elementi della leggenda
            const legendItems = legendSvg.selectAll("legendItem")
                .data(legendData)
                .enter().append("g")
                .attr("transform", (d, i) => `translate(10, ${30 + i * (size + 10)})`);

            // Aggiungi i simboli alla leggenda
            legendItems.each(function (d) {
                if (d.symbol === "line") {
                    d3.select(this).append("line")
                        .attr("x1", 0)
                        .attr("y1", size / 2 + 2)
                        .attr("x2", size)
                        .attr("y2", size / 2 + 2)
                        .attr("stroke", d.color)
                        .attr("stroke-dasharray", d.strokeDasharray);
                } else if (d.symbol === "+") {
                    d3.select(this).append("text")
                        .attr("x", size / 2 - 2)
                        .attr("y", size / 2 + 7)
                        .attr("text-anchor", "middle")
                        .style("font-size", "12px")
                        .style("stroke", d.color)
                        .text(d.symbol);
                } else if (d.symbol === "circle") {
                    d3.select(this).append("circle")
                        .attr("cx", size / 2 - 2)
                        .attr("cy", size / 2 + 5)
                        .attr("r", d.radius)
                        .style("fill", d.fill)
                        .style("stroke", d.color);
                }
            });

            // Aggiungi le etichette alla leggenda
            legendItems.append("text")
                .attr("x", size * 1.3)
                .attr("y", size / 2)
                .attr("dy", "0.35em")
                .style("font-size", "12px")
                .text(d => d.label)
                .attr("text-anchor", "left")
                .attr("fill", "white")
                .style("alignment-baseline", "middle");

            // Aggiungi titolo leggenda
            legendSvg.append("text")
                .attr("x", 10)
                .attr("y", 15)
                .text("Legend")
                .attr("fill", "white")
                .style("font-size", "12px");
        };

        

        // Chiamata alla funzione createLegend per aggiungere la leggenda
        createLegend();





    }, [selectedRegion, allData, setSelectedRegion, pollutant]);

    return (
        <div style={{ display:'flex', width: "640px", height: "350px", overflow: 'hidden', position: 'relative', top: 0, left: 0}}>
            <svg ref={svgRef}></svg>
            <div ref={tooltipRef} style={{ opacity: 0 }}></div>
            <svg ref={legendRef}style={{ position: 'absolute', bottom: '10px' }} ></svg>
        </div>
    );
};

export default BoxPlot;