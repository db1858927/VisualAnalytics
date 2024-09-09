import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const LineChart = ({ selectedRegion, pollutant, setYears }) => {
    const svgRef = useRef(null);

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();
        
        const margin = { top: 10, right: 30, bottom: 40, left: 60 };
        const width = 760 - margin.left - margin.right;
        const height = 320 - margin.top - margin.bottom;

        
        const svgElement = svg
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

       
        const files = [
           
            `./years${pollutant}/dati_2010.csv`,
            `./years${pollutant}/dati_2011.csv`,
            `./years${pollutant}/dati_2012.csv`,
            `./years${pollutant}/dati_2013.csv`,
            `./years${pollutant}/dati_2014.csv`,
            `./years${pollutant}/dati_2015.csv`,
            `./years${pollutant}/dati_2016.csv`,
            `./years${pollutant}/dati_2017.csv`,
            `./years${pollutant}/dati_2018.csv`,
            `./years${pollutant}/dati_2019.csv`,
            `./years${pollutant}/dati_2020.csv`,
            `./years${pollutant}/dati_2021.csv`,
            `./years${pollutant}/dati_2022.csv`,
           
        ];

        
        function rowConverter(year) {
            return function (d) {
                if (pollutant == '_total') {
                    return {
                        date: new Date(year, 0), 
                        region: d.Regione, 
                        no2: d.no2 !== '' ? +d.no2 : null,
                        pm10: d.pm10 !== '' ? +d.pm10 : null,
                        pm25: d.pm25 !== '' ? +d.pm25 : null,
                        o3: d.o3 !== '' ? +d.o3 : null

                    };
                }
                else {
                    return {
                        date: new Date(year, 0), 
                        region: d.Regione, 
                        value: +d.media_yy

                    };
                }
            };
        }

        const getColorScale = (pollutant) => {
            if (pollutant === '_pm25') {
                return d3.scaleThreshold()
                    .domain([10, 20, 25, 50, 75, 800])
                    .range(d3.schemeReds[6])
                    .unknown("white");
            } else if (pollutant === '_pm10') {
                return d3.scaleThreshold()
                    .domain([20, 40, 50, 100, 510, 1200])
                    .range(d3.schemeReds[6])
                    .unknown("white");
            } else if (pollutant === '_o3') {
                return d3.scaleThreshold()
                    .domain([50, 100, 130, 240, 380, 800])
                    .range(d3.schemeReds[6])
                    .unknown("white");
            }
            else if (pollutant === '_no2') {
                return d3.scaleThreshold()
                    .domain([40, 90, 120, 230, 340, 1000])
                    .range(d3.schemeReds[6])
                    .unknown("white");

            } else {
                
                return d3.scaleThreshold()
                    .domain([0, 100]) 
                    .range(['#ffffff', '#000000']) 
                    .unknown("white");
            }
        };


        const pollutants = ['pm10', 'pm25', 'no2', 'o3'];
        const colorScale_ = d3.scaleOrdinal()
            .domain(pollutants) 
            .range(d3.schemeCategory10);

        
        Promise.all(files.map(file => {
            const year = parseInt(file.match(/(\d{4})\.csv$/)[1]); 
            return d3.csv(file, rowConverter(year)); 
        }))
            .then(datasets => {
                
                const allData = datasets.flat();

                const filteredData = allData.filter(d => {
                    return selectedRegion
                        ? d.region === selectedRegion
                        : selectedRegion
                            ? d.region === selectedRegion

                            : true; 
                });
                let scatterData;
                let colorScale;

                if (pollutant === '_total') {
                    const x = d3.scaleBand()
                        .range([0, width])
                        .padding(0.1);

                    const y = d3.scaleLinear()
                        .nice()
                        .range([height, 0]);

                   
                    svgElement.append("g")
                        .attr("class", "x-axis")
                        .attr("transform", `translate(0,${height})`);

                    
                    svgElement.append("g")
                        .attr("class", "y-axis");

                    
                    svgElement.append("text")
                        .attr("class", "y-axis-label")
                        .attr("text-anchor", "end")
                        .attr("transform", "rotate(-90)")
                        .attr("y", -32)
                        .attr("x", -height / 2 + 85)
                        .attr("fill", "white")
                        .style("font-size", "10px");
                        
                    svgElement.append("text")
                    .attr("text-anchor", "end")
                    .attr("y", height +35)
                    .attr("x",width/2)
                    .text(`Years`)
                    .attr("fill", "white")
                    .style("font-size", "10px");
                    
                       

                    

                    pollutants.forEach((pollutant, index) => {
                        
                        const dataForPollutant = filteredData.filter(d => d[pollutant] !== null);

                       
                        const dataByRegion = d3.rollup(
                            dataForPollutant,
                            v => d3.mean(v, d => d[pollutant]),
                            d => d.date.getFullYear(),
                        );


                       
                        const scatterData = Array.from(dataByRegion, ([year, value]) => ({ year, value }));
                        scatterData.sort((a, b) => a.year - b.year);

                        
                        if (scatterData.length > 0) {

                           
                            x.domain(scatterData.map(d => String(d.year)));
                            y.domain([d3.min(scatterData, d => d.value) - 5, d3.max(scatterData, d => d.value) + 5]);

                           
                            svgElement.select(".x-axis")
                                .call(d3.axisBottom(x).tickSizeOuter(0));

                            
                            svgElement.select(".y-axis")
                                .call(d3.axisLeft(y));

                            
                            svgElement.select(".y-axis-label")
                                .text(`Average oncentration of all pollutants (µg/m³)`);

                            
                            svgElement.append("path")
                                .datum(scatterData)
                                .attr("fill", "none")
                                .attr("stroke", colorScale_(pollutant))
                                .attr("stroke-width", 1.5)
                                .attr("d", d3.line()
                                    .x(d => x(String(d.year)) + x.bandwidth() / 2) 
                                    .y(d => y(d.value))
                                );

                            colorScale = getColorScale(`_${pollutant}`);

                            
                            svgElement.selectAll(`.circle-${pollutant}`)
                                .data(scatterData)
                                .enter()
                                .append("circle")
                                .attr("class", `circle-${pollutant}`)
                                .attr("cx", d => x(String(d.year)) + x.bandwidth() / 2) // Adjust x position for band scale
                                .attr("cy", d => y(d.value))
                                .attr("r", 5)
                                .attr("fill", d => colorScale(d.value))
                                .on("mouseover", function(event, d) {
                                    d3.select(this).transition().attr("r", 9)
                                    ;
        
                                })
                                .on("mouseout", function(event, d) {
                                    d3.select(this).transition().attr("r", 5);
                                })
                                .on("click", function(event, d) {
                                    console.log("Clicked data:", d); 
                                    if (d && d.year) {
                                      setYears(String(d.year));
                                    } else {
                                      console.error("d.year is undefined or null");
                                    }
                                });
                            

                        }




                    });

                } else {

                   
                    const dataByYear = d3.rollup(
                        filteredData,
                        v => d3.mean(v, d => d.value),
                        d => d.date.getFullYear() 
                    );




                    colorScale = getColorScale(pollutant);

                    
                    scatterData = Array.from(dataByYear, ([year, value]) => ({ year, value }));

                   
                    scatterData.sort((a, b) => a.year - b.year);

                   
                    const x = d3.scaleBand()
                        .domain(scatterData.map(d => String(d.year)))
                        .range([0, width])
                        .padding(0.1);

                    const y = d3.scaleLinear()
                        .domain([d3.min(scatterData, d => d.value)- 5, d3.max(scatterData, d => d.value)+5])
                        .nice()
                        .range([height, 0]);

                    
                    svgElement.selectAll("*").remove();

                    
                    svgElement.append("g")
                        .attr("transform", `translate(0,${height})`)
                        .call(d3.axisBottom(x).tickSizeOuter(0));

                   
                    svgElement.append("g")
                        .call(d3.axisLeft(y));

                    svgElement.append("text")
                        .attr("text-anchor", "end")
                        .attr("transform", "rotate(-90)")
                        .attr("y", -32)
                        .attr("x", - height / 2 + 90)
                        .text(`Average concentration of ${pollutant.replace('_', '')} ${selectedRegion ? `of ${selectedRegion} (µg/m³)` : ''}`)
                        .attr("fill", "white")
                        .style("font-size", "10px");

                    
                    svgElement.append("path")
                        .datum(scatterData)
                        .attr("fill", "none")
                        .attr("stroke", colorScale_(pollutant.replace('_', '')))
                        .attr("stroke-width", 1.5)
                        .attr("d", d3.line()
                            .x(d => x(String(d.year)) + x.bandwidth() / 2) 
                            .y(d => y(d.value))
                        );

                    
                    svgElement.selectAll("circle")
                        .data(scatterData)
                        .enter()
                        .append("circle")
                        .attr("cx", d => x(String(d.year)) + x.bandwidth() / 2) 
                        .attr("cy", d => y(d.value))
                        .attr("r",  5)
                        .attr("fill", d => colorScale(d.value))
                        .on("mouseover", function(event, d) {
                            d3.select(this).transition().attr("r", 9)
                            ;

                        })
                        .on("mouseout", function(event, d) {
                            d3.select(this).transition().attr("r", 5);
                        })
                        .on("click", function(event, d) {
                            console.log("Clicked data:", d); 
                            if (d && d.year) {
                              setYears(String(d.year));
                            } else {
                              console.error("d.year is undefined or null");
                            }
                        })
                }

             

                const labels = pollutants.map(p => `${p}`);

               
                const legend = svgElement.append("g")
                    .attr("class", "legend")
                    .attr("transform", `translate(${width - 250}, -10)`); 

               
                legend.selectAll("line")
                    .data(labels)
                    .enter()
                    .append("line")
                    .attr("x1", (d, i) => i * 70) 
                    .attr("y1", 15)
                    .attr("x2", (d, i) => i * 70 + 10) 
                    .attr("y2", 15)
                    .attr("stroke", d => colorScale_(d))
                    .attr("stroke-width", 2);

               
                legend.selectAll("text")
                    .data(labels)
                    .enter()
                    .append("text")
                    .attr("x", (d, i) => i * 70 + 15) 
                    .attr("y", 15)
                    .text(d => d)
                    .attr("fill", "white")
                    .style("font-size", "12px")
                    .attr("alignment-baseline", "middle");
            })
            .catch(error => {
                console.error('Error loading data:', error);
            });

    }, [selectedRegion, pollutant]);

    return (
        <div>
            <svg ref={svgRef}></svg>
        </div>
    );
};

export default LineChart;