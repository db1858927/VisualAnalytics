import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const LineChart = ({ selectedRegion }) => {
    const svgRef = useRef(null);

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();
        // Margin convention
        const margin = { top: 10, right: 30, bottom: 30, left: 60 };
        const width = 760 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        // Create SVG element
        const svgElement = svg
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Array of CSV file paths (each representing a year)
        const files = [
            "./years_no2/dati_2004.csv",
            "./years_no2/dati_2005.csv",
            "./years_no2/dati_2006.csv",
            "./years_no2/dati_2007.csv",
            "./years_no2/dati_2008.csv",
            "./years_no2/dati_2009.csv",
            "./years_no2/dati_2010.csv",
            "./years_no2/dati_2011.csv",
            "./years_no2/dati_2012.csv",
            "./years_no2/dati_2013.csv",
            "./years_no2/dati_2014.csv",
            "./years_no2/dati_2015.csv",
            "./years_no2/dati_2016.csv",
            "./years_no2/dati_2017.csv",
            "./years_no2/dati_2018.csv",
            "./years_no2/dati_2019.csv",
            "./years_no2/dati_2020.csv",
            "./years_no2/dati_2021.csv",
            "./years_no2/dati_2022.csv",
            // Add more file paths as needed
        ];

        // Helper function to convert CSV rows
        function rowConverter(year) {
            return function (d) {
                return {
                    date: new Date(year, 0), // Use year from file name
                    region: d.Regione, // Region from CSV data
                    value: +d.media_yy
                };
            };
        }




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

                // Group filtered data by year and calculate averages
                const dataByYear = d3.rollup(
                    filteredData,
                    v => d3.mean(v, d => d.value),
                    d => d.date.getFullYear() // Group by year from date
                );

                const colorScale = d3.scaleThreshold()
                    .domain([10, 20, 25, 50, 75, 800])  // Definisci il dominio in base alla tua scala di colori
                    .range(d3.schemeReds[6])
                    .unknown("white");

                // Format data for scatter plot
                const scatterData = Array.from(dataByYear, ([year, value]) => ({ year, value }));

                // Sort scatterData by year
                scatterData.sort((a, b) => a.year - b.year);

                // Create scales
                const x = d3.scaleBand()
                    .domain(scatterData.map(d => String(d.year)))
                    .range([0, width])
                    .padding(0.1);

                const y = d3.scaleLinear()
                    .domain([0, d3.max(scatterData, d => d.value)])
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
                    .attr("x", - height / 2 + 50)
                    .text("Concentration of NO2 (µg/m³)")
                    .attr("fill", "white")
                    .style("font-size", "10px");

                // Add line connecting the points
                svgElement.append("path")
                    .datum(scatterData)
                    .attr("fill", "none")
                    .attr("stroke", "white")
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
                    .attr("r", 5)
                    .attr("fill", d => colorScale(d.value));
            })
            .catch(error => {
                console.error('Error loading data:', error);
            });

    }, [selectedRegion]);

    return (
        <div>
            <svg ref={svgRef}></svg>
        </div>
    );
};

export default LineChart;