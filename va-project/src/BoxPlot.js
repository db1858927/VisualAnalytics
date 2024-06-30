import React, { useState, useRef, useEffect } from 'react';
import * as d3 from "d3";

export default function BoxPlot() {

    //const[data, setData] = useState([])
    //const [data] = useState([25, 50, 35, 15, 94, 10]);
    const svgRef = useRef();

    //useEffect( () =>
    //csv('/data.csv').then(data => {
    //setData(data)
    //})
    //)
    // create dummy data
    const data = [12, 19, 11, 13, 12, 22, 13, 4, 15, 16, 18, 19, 20, 12, 11, 9]

    // Compute summary statistics used for the box:
    const data_sorted = data.sort(d3.ascending)
    const q1 = d3.quantile(data_sorted, .25)
    const median = d3.quantile(data_sorted, .5)
    const q3 = d3.quantile(data_sorted, .75)
    const interQuantileRange = q3 - q1
    const min = q1 - 1.5 * interQuantileRange
    const max = q1 + 1.5 * interQuantileRange


    //rerender data when change
    useEffect(() => {
        // set the dimensions and margins of the graph
        const weigth = 400;
        const height = 300;
        const svg = d3.select(svgRef.current)
            .attr('width', weigth)
            .attr('height', height)
            .style('margin-top', 50)
            .style('overflow', 'visible');
        // Show the Y scale
        const y = d3.scaleLinear()
            .domain([0, 24])
            .range([height, 0]);
        svg.call(d3.axisLeft(y))

        // a few features for the box
        const center = 200
        const width = 100

        // Show the main vertical line
        svg
            .append("line")
            .attr("x1", center)
            .attr("x2", center)
            .attr("y1", y(min))
            .attr("y2", y(max))
            .attr("stroke", "black")

        // Show the box
        svg
            .append("rect")
            .attr("x", center - width / 2)
            .attr("y", y(q3))
            .attr("height", (y(q1) - y(q3)))
            .attr("width", width)
            .attr("stroke", "black")
            .style("fill", "#69b3a2")

        // show median, min and max horizontal lines
        svg
            .selectAll("toto")
            .data([min, median, max])
            .enter()
            .append("line")
            .attr("x1", center - width / 2)
            .attr("x2", center + width / 2)
            .attr("y1", function (d) { return (y(d)) })
            .attr("y2", function (d) { return (y(d)) })
            .attr("stroke", "black")

    }, [data])

    return (
        <div>
            <svg ref={svgRef}></svg>
        </div>
    )
}