import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import './App.css';

const BoxPlot = ({ hoverProvincia, hoveredRegion, selectedRegion, allData, setSelectedRegion, pollutant, selectedProvinces, setHoveredProvincia, setHoveredRegion }) => {
    const svgRef = useRef();
    const tooltipRef = useRef();
    const legendRef = useRef();
    const [groupData, setGroupData] = useState(null);
    const xScaleRef = useRef(null); // Ref per salvare la scala X
    const yScaleRef = useRef(null);








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

        // Filtro dei dati: se selectedProvinces non è vuoto, mostra solo quelle province
        const data = (selectedProvinces && selectedProvinces.length > 0)
            ? allData.filter(d => selectedProvinces.includes(d.Provincia) && d.media_yy)
            : (selectedRegion
                ? allData.filter(d => (d.Regione) === getRegionName(selectedRegion) && d.Provincia && d.media_yy)
                : allData.filter(d => d.Regione && d.media_yy));

        const margin = { top: 10, right: 40, bottom: 60, left: 50 };
        const width = 540 - margin.left - margin.right;
        const height = 350 - margin.top - margin.bottom;

        const svgElement = svg
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
        const groups = (selectedProvinces && selectedProvinces.length > 0)
            ? selectedProvinces
            : (selectedRegion
                ? Array.from(new Set(data.map(d => d.Provincia)))
                : Array.from(new Set(data.map(d => d.Regione))));

        const groupData = new Map();

        groups.forEach(group => {
            // Filtra i valori in base alla provincia o regione
            const filteredData = data.filter(d => {
                if (selectedProvinces && selectedProvinces.length > 0) {
                    return d.Provincia === group;  // Filtra per provincia
                } else if (selectedRegion) {
                    return d.Provincia === group;  // Filtra per provincia
                } else {
                    return d.Regione === group;  // Filtra per regione
                }
            });

            const groupedData = (selectedRegion || (selectedProvinces && selectedProvinces.length > 0))
                ? filteredData.map(d => ({ provincia: d.Provincia, value: +d.media_yy })) // Dati per comuni
                : d3.rollups(filteredData, v => d3.mean(v, d => +d.media_yy), d => d.Provincia) // Aggrega per provincia
                    .map(([provincia, media]) => ({ provincia, value: media }));

            // Estrai solo i valori delle medie
            const values = groupedData.map(d => d.value);

            // Assicurati che stai lavorando con le medie e non con i dati individuali
            if (values.length > 0) {
                values.sort(d3.ascending); // Ordina i valori delle medie
                const q1 = d3.quantile(values, 0.25);
                const median = d3.quantile(values, 0.5).toFixed(2);
                const q3 = d3.quantile(values, 0.75);
                const interQuantileRange = q3 - q1;
                const min = Math.max(d3.min(values), q1 - 1.5 * interQuantileRange).toFixed(2);
                const max = Math.min(d3.max(values), q3 + 1.5 * interQuantileRange).toFixed(2);
                const mean = d3.mean(values) ? d3.mean(values).toFixed(2) : '0';

                // Filtra gli outliers basati sui valori di `values`
                const outliers = groupedData
                    .filter(d => d.value < min || d.value > max)
                    .map(d => ({
                        ...d,
                        value: d.value.toFixed(2)  // Applica toFixed solo al valore
                    }));



                const provinceData = (selectedRegion || (selectedProvinces && selectedProvinces.length > 0))
                    ? filteredData.map(d => ({ provincia: d.Provincia, mean: +d.media_yy }))  // Dati per comuni (non aggregati)
                    : groupedData.map(d => ({ provincia: d.provincia, mean: d.value }));  // Dati medi aggregati per provincia


                // Settiamo i dati aggregati nella mappa
                groupData.set(group, { q1, median, q3, interQuantileRange, min, max, mean, values, outliers, provinceData });
            }
        });

        setGroupData(groupData);

        const presentRegions = (selectedProvinces && selectedProvinces.length > 0)
            ? selectedProvinces
            : (selectedRegion
                ? Array.from(new Set(data.map(d => d.Provincia)))
                : Array.from(new Set(data.map(d => d.Regione))));

        const xScale = d3.scaleBand()
            .domain(presentRegions)  // Usa solo le regioni o province visibili nei dati
            .range([0, width])
            .paddingInner(1)
            .paddingOuter(.5);

        // Assegna la scala x al ref


        const yScale = d3.scaleLinear()
            .domain([0, d3.max(allData, d => +d.media_yy) + 10])
            .range([height, 0]);

        // Assegniamo le scale al ref per poterle utilizzare in altri useEffect
        // xScaleRef.current = xScale;
        // yScaleRef.current = yScale;




        const allValues = data.map(d => +d.media_yy);

        const maxDataValue = d3.max(allValues);
        const minDataValue = d3.min(allValues)
        const maxDomain = Math.max(maxDataValue, 40);

        const y = d3.scaleLinear()
            .domain([minDataValue - 5, maxDataValue + 5])
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

            xScaleRef.current = x;
            yScaleRef.current = y;

        svgElement.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "rotate(-30)")
            .style("text-anchor", "end");

        const boxWidth = (selectedRegion) ? 25 : 17;



        groups.forEach(group => {
            const { q1, median, q3, min, max, mean, outliers, region } = groupData.get(group);
            const center = x(group) + x.bandwidth() / 2;

            svgElement.append("line")
                .attr("x1", center)
                .attr("x2", center)
                .attr("y1", y(min))
                .attr("y2", y(max))
                .attr("stroke", "white");

            const box = svgElement.append("rect")

                .data([group])  // Associa 'group' come dato
                .attr("x", center - boxWidth / 2)
                .attr("y", y(q3))
                .attr("height", y(q1) - y(q3))
                .attr("width", boxWidth)
                .attr("stroke", "white")
                .style("opacity", 0.5)
                .style("fill", "currentColor");

            [min, median, max].forEach(val => {
                svgElement.append("line")
                    .attr("x1", center - boxWidth / 2)
                    .attr("x2", center + boxWidth / 2)
                    .attr("y1", y(val))
                    .attr("y2", y(val))
                    .attr("stroke", "white");
            });




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
                    .attr("cy", d => y(d.value))  // Usa il valore dell'outlier
                    .attr("r", 3)
                    .style("fill", "none")
                    .attr("stroke", "white")
                    .on("mouseover", function (event, d) {
                        // Evidenzia l'outlier quando fai hover
                        d3.select(this)
                            .transition()
                            .duration(200)
                            .attr("r", 5)  // Aumenta il raggio per evidenziare l'outlier
                            .style("fill", "red");

                        // Evidenzia la provincia corrispondente chiamando setHoveredProvincia
                        setHoveredProvincia(d.provincia);  // Imposta la provincia corretta

                        // Se desideri anche evidenziare qualcosa nella mappa o altre visualizzazioni,
                        // puoi gestire qui eventuali altri cambiamenti
                    })
                    .on("mouseout", function (event, d) {
                        // Ripristina l'aspetto originale dell'outlier
                        d3.select(this)
                            .transition()
                            .duration(200)
                            .attr("r", 3)  // Ripristina il raggio originale
                            .style("fill", "none");

                        // Ripristina la selezione della provincia
                        setHoveredProvincia(null);  // Resetta la provincia selezionata
                    });

            }
            if (pollutant == '_pm10') {
                svgElement.append("line")
                    .attr("x1", 0)
                    .attr("x2", width)
                    .attr("y1", y(40))
                    .attr("y2", y(40))
                    .attr("stroke", "red")
                    .attr("stroke-dasharray", "5,5");
            }
            else if (pollutant == '_pm25') {
                svgElement.append("line")
                    .attr("x1", 0)
                    .attr("x2", width)
                    .attr("y1", y(20))
                    .attr("y2", y(20))
                    .attr("stroke", "red")
                    .attr("stroke-dasharray", "5,5");

            } else if (pollutant == '_no2') {
                svgElement.append("line")
                    .attr("x1", 0)
                    .attr("x2", width)
                    .attr("y1", y(90))
                    .attr("y2", y(90))
                    .attr("stroke", "red")
                    .attr("stroke-dasharray", "5,5");
            } else if (pollutant == '_o3') {
                svgElement.append("line")
                    .attr("x1", 0)
                    .attr("x2", width)
                    .attr("y1", y(100))
                    .attr("y2", y(100))
                    .attr("stroke", "red")
                    .attr("stroke-dasharray", "5,5");
            }

            else {

                console.log("Pollutant not recognized:", pollutant);
            }



            let tooltipText = `<b>${group}</b> <br>Median: ${median}<br>Mean: ${mean}<br>Min: ${min}<br>Max: ${max}`;
            if (outliers.length > 0) {
                // Itera sugli outliers per costruire il testo del tooltip
                tooltipText += `<br>Outliers: ${outliers.map(d => ` ${d.value}`).join(', ')}`;
            }

            box.on("mouseover", function (event, d) {
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
                setHoveredRegion(d);
                setHoveredProvincia(d);

            })
                .on("mouseout", function (event) {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .style("opacity", .7)
                        .attr("stroke", "white");

                    tooltip.transition().duration(500).style("opacity", 0);
                    setHoveredRegion(null);
                    setHoveredProvincia(null);
                })
                .on("click", function () {

                    setSelectedRegion(group);

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
            const legendHeight = 140;

            const legendSvg = d3.select(legendRef.current)
                .attr("width", legendWidth)
                .attr("height", legendHeight)
                .style("position", "absolute")
                .style("bottom", "25px") // Cambia la posizione della legenda
                .style("left", `${width + margin.left + 35}px`) // Posiziona la legenda accanto al grafico
                .style("padding", "5px")
                .style("border-radius", "5px")
                .style("box-shadow", "0 0 10px rgba(0,0,0,0.2)");

            const size = 15;


            const legendData = [
                { label: `EU Limit`, symbol: "line", strokeDasharray: "5,5", color: "red", fontSize: "9px" },
                { label: "Mean", symbol: "+", color: "white" },
                { label: "Outliers", symbol: "circle", radius: 3, color: "white", fill: "none" },
                { label: "Median", symbol: "-", color: "white" },
            ];


            const legendItems = legendSvg.selectAll("legendItem")
                .data(legendData)
                .enter().append("g")
                .attr("transform", (d, i) => `translate(10, ${30 + i * (size + 10)})`);


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
                } else if (d.symbol === "-") {
                    d3.select(this).append("line")
                        .attr("x1", 0)
                        .attr("y1", size / 2 + 2.5)
                        .attr("x2", size)
                        .attr("y2", size / 2 + 2.5)
                        .attr("stroke", d.color)
                }

            });


            legendItems.append("text")
                .attr("x", size * 1.3)
                .attr("y", size / 2)
                .attr("dy", "0.35em")
                .style("font-size", "12px")
                .text(d => d.label)
                .attr("text-anchor", "left")
                .attr("fill", "white")
                .style("alignment-baseline", "middle");


            legendSvg.append("text")
                .attr("x", 10)
                .attr("y", 15)
                .text("Legend")
                .attr("fill", "white")
                .style("font-size", "12px");
        };




        createLegend();






    }, [selectedRegion, allData, setSelectedRegion, pollutant, selectedProvinces]);
    

    useEffect(() => {
        const svg = d3.select(svgRef.current);

        if (!hoverProvincia && !hoveredRegion) {
            // Se non c'è nulla di evidenziato, ripristina l'opacità e lo stroke originali
            svg.selectAll("rect")
                .transition()
                .duration(200)
                .attr("stroke", "white")
                .style("opacity", 0.5);
            return; // Esci dall'effetto
        }

        svg.selectAll("rect").each(function (d) {
            const rect = d3.select(this);

            const isHighlighted = d === hoverProvincia || d === hoveredRegion;

            if (isHighlighted) {
                rect.transition()
                    .duration(200)
                    .attr("stroke", "red")
                    .style("opacity", 1);
            } else {
                rect.transition()
                    .duration(200)
                    .attr("stroke", "white")
                    .style("opacity", 0.5);
            }
        });
    }, [hoverProvincia, hoveredRegion]);



    useEffect(() => {
        const svg = d3.select(svgRef.current);
        svg.selectAll("circle.hover-circle").remove();  // Rimuove eventuali cerchi esistenti
    
        if (hoverProvincia && groupData && !selectedRegion && (!selectedProvinces || selectedProvinces.length === 0)) {
            let foundProvincia = null;
            let regione = null;
    
            // Cerca in ogni gruppo (regione) se contiene la provincia specifica
            groupData.forEach((group, key) => {
                const provincia = group.provinceData.find(p => p.provincia === hoverProvincia);
                if (provincia) {
                    foundProvincia = provincia;
                    regione = key;  // Salva la regione corrispondente
                }
            });
    
            if (foundProvincia && regione) {
                const mean = yScaleRef.current(foundProvincia.mean);  // Converti mean in un numero
                const center = xScaleRef.current(regione);  // Posiziona il cerchio sulla regione corretta
    
                // Verifica che yScale esista e posiziona il cerchio
                if (yScaleRef.current) {
                    svg.append("circle")
                        .attr("class", "hover-circle")
                        .attr("cx", center + 50)  // Centra il cerchio sulla banda
                        .attr("cy", mean + 10)  // Passa il numero alla scala Y
                        .attr("r", 5)  // Maggiore del raggio degli outliers
                        .style("fill", "red")
                        .style("stroke", "white")
                        .style("stroke-width", 1)
                        .style("opacity", 0.9);
                }
            }
        }
    }, [hoverProvincia, groupData]);



    return (
        <div style={{ display: 'flex', width: "640px", height: "350px", overflow: 'hidden', position: 'relative', top: 0, left: 0 }}>
            <svg ref={svgRef}></svg>
            <div ref={tooltipRef} style={{ opacity: 0 }}></div>
            <svg ref={legendRef} style={{ position: 'absolute', bottom: '10px' }} ></svg>
        </div>
    );
};

export default BoxPlot;