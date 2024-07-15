import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const LineChart = ({ selectedRegion, pollutant, setYears }) => {
    const svgRef = useRef(null);

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();
        // Margin convention
        const margin = { top: 10, right: 30, bottom: 40, left: 60 };
        const width = 760 - margin.left - margin.right;
        const height = 320 - margin.top - margin.bottom;

        // Create SVG element
        const svgElement = svg
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Array of CSV file paths (each representing a year)
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
            // Add more file paths as needed
        ];

        // Helper function to convert CSV rows
        function rowConverter(year) {
            return function (d) {
                if (pollutant == '_total') {
                    return {
                        date: new Date(year, 0), // Use year from file name
                        region: d.Regione, // Region from CSV data
                        no2: d.no2 !== '' ? +d.no2 : null,
                        pm10: d.pm10 !== '' ? +d.pm10 : null,
                        pm25: d.pm25 !== '' ? +d.pm25 : null,
                        o3: d.o3 !== '' ? +d.o3 : null

                    };
                }
                else {
                    return {
                        date: new Date(year, 0), // Use year from file name
                        region: d.Regione, // Region from CSV data
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
                // Default or fallback scale in case pollutant doesn't match known types
                return d3.scaleThreshold()
                    .domain([0, 100]) // Example domain
                    .range(['#ffffff', '#000000']) // Example range
                    .unknown("white");
            }
        };


        const pollutants = ['pm10', 'pm25', 'no2', 'o3'];
        const colorScale_ = d3.scaleOrdinal()
            .domain(pollutants) // Assuming pollutants is an array of pollutant types
            .range(d3.schemeCategory10);

        // Load and process all CSV files
        Promise.all(files.map(file => {
            const year = parseInt(file.match(/(\d{4})\.csv$/)[1]); // Extract year from file name
            return d3.csv(file, rowConverter(year)); // Pass year to rowConverter
        }))
            .then(datasets => {
                // Combine all datasets into a single array
                const allData = datasets.flat();

                const filteredData = allData.filter(d => {
                    return selectedRegion
                        ? d.region === selectedRegion
                        : selectedRegion
                            ? d.region === selectedRegion

                            : true; // Se nessuna regione è selezionata, restituisci tutti i dati
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

                    // Add X axis (only once)
                    svgElement.append("g")
                        .attr("class", "x-axis")
                        .attr("transform", `translate(0,${height})`);

                    // Add Y axis (only once)
                    svgElement.append("g")
                        .attr("class", "y-axis");

                    // Add Y axis label (only once)
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
                    
                       

                    // Start processing each pollutant

                    pollutants.forEach((pollutant, index) => {
                        // Filter data for the current pollutant
                        const dataForPollutant = filteredData.filter(d => d[pollutant] !== null);

                        // Group data by region and calculate mean for each region
                        const dataByRegion = d3.rollup(
                            dataForPollutant,
                            v => d3.mean(v, d => d[pollutant]),
                            d => d.date.getFullYear(),
                        );

                        // Format data for scatter plot
                        const scatterData = Array.from(dataByRegion, ([year, value]) => ({ year, value }));

                        // Check if scatterData is not empty before proceeding
                        if (scatterData.length > 0) {
                            // Sort scatterData by value (ascending)
                            scatterData.sort((a, b) => a.value - b.value);

                            // Update domain of x scale
                            x.domain(scatterData.map(d => String(d.year)));
                            y.domain([d3.min(scatterData, d => d.value) - 5, d3.max(scatterData, d => d.value) + 5]);

                            // Update X axis
                            svgElement.select(".x-axis")
                                .call(d3.axisBottom(x).tickSizeOuter(0));

                            // Update Y axis
                            svgElement.select(".y-axis")
                                .call(d3.axisLeft(y));

                            // Update Y axis label
                            svgElement.select(".y-axis-label")
                                .text(`Average oncentration of all pollutants (µg/m³)`);

                            // Add line connecting the points
                            svgElement.append("path")
                                .datum(scatterData)
                                .attr("fill", "none")
                                .attr("stroke", colorScale_(pollutant))
                                .attr("stroke-width", 1.5)
                                .attr("d", d3.line()
                                    .x(d => x(String(d.year)) + x.bandwidth() / 2) // Adjust x position for band scale
                                    .y(d => y(d.value))
                                );

                            colorScale = getColorScale(`_${pollutant}`);

                            // Add circles for scatter plot
                            svgElement.selectAll(`.circle-${pollutant}`)
                                .data(scatterData)
                                .enter()
                                .append("circle")
                                .attr("class", `circle-${pollutant}`)
                                .attr("cx", d => x(String(d.year)) + x.bandwidth() / 2) // Adjust x position for band scale
                                .attr("cy", d => y(d.value))
                                .attr("r", 5)
                                .attr("fill", d => colorScale(d.value));
                            // Array of labels corresponding to pollutants

                        }




                    });

                } else {

                    // Group filtered data by year and calculate averages
                    const dataByYear = d3.rollup(
                        filteredData,
                        v => d3.mean(v, d => d.value),
                        d => d.date.getFullYear() // Group by year from date
                    );




                    colorScale = getColorScale(pollutant);

                    // Format data for scatter plot
                    scatterData = Array.from(dataByYear, ([year, value]) => ({ year, value }));

                    // Sort scatterData by year
                    scatterData.sort((a, b) => a.year - b.year);

                    // Create scales
                    const x = d3.scaleBand()
                        .domain(scatterData.map(d => String(d.year)))
                        .range([0, width])
                        .padding(0.1);

                    const y = d3.scaleLinear()
                        .domain([d3.min(scatterData, d => d.value)- 5, d3.max(scatterData, d => d.value)+5])
                        .nice()
                        .range([height, 0]);

                    // Clear existing content before updating
                    svgElement.selectAll("*").remove();

                    // Add X axis
                    svgElement.append("g")
                        .attr("transform", `translate(0,${height})`)
                        .call(d3.axisBottom(x).tickSizeOuter(0));

                    // Add Y axis
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

                    // Add line connecting the points
                    svgElement.append("path")
                        .datum(scatterData)
                        .attr("fill", "none")
                        .attr("stroke", colorScale_(pollutant.replace('_', '')))
                        .attr("stroke-width", 1.5)
                        .attr("d", d3.line()
                            .x(d => x(String(d.year)) + x.bandwidth() / 2) // Adjust x position for band scale
                            .y(d => y(d.value))
                        );

                    // Add circles for scatter plot
                    svgElement.selectAll("circle")
                        .data(scatterData)
                        .enter()
                        .append("circle")
                        .attr("cx", d => x(String(d.year)) + x.bandwidth() / 2) // Adjust x position for band scale
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
                            console.log("Clicked data:", d); // Debugging line to check the data
                            if (d && d.year) {
                              setYears(String(d.year));
                            } else {
                              console.error("d.year is undefined or null");
                            }
                        })
                }

             

                const labels = pollutants.map(p => `${p}`);

                // Add legend
                const legend = svgElement.append("g")
                    .attr("class", "legend")
                    .attr("transform", `translate(${width - 250}, -10)`); // Adjust position as needed

                // Add colored rectangles to legend
                legend.selectAll("line")
                    .data(labels)
                    .enter()
                    .append("line")
                    .attr("x1", (d, i) => i * 70) // Adjust spacing between elements
                    .attr("y1", 15)
                    .attr("x2", (d, i) => i * 70 + 10) // Adjust spacing between elements
                    .attr("y2", 15)
                    .attr("stroke", d => colorScale_(d))
                    .attr("stroke-width", 2);

                // Add text labels to legend
                legend.selectAll("text")
                    .data(labels)
                    .enter()
                    .append("text")
                    .attr("x", (d, i) => i * 70 + 15) // Adjust spacing between elements
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