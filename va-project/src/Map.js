import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Map = ({ selectedRegion, setSelectedRegion }) => {
  const svgRef = useRef();
  const initialFeaturesRef = useRef(null);
  const legendRef = useRef();
  const provinciaDataRef = useRef();
  const [hasClickedRegion, setHasClickedRegion] = useState(false);
  

  useEffect(() => {

    if(!selectedRegion){
      setHasClickedRegion(false);
    }
    
    const margin = { top: 0, right: 20, bottom: 0, left: 40 };
    const width = 640 - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const path = d3.geoPath();
    const projection = d3.geoMercator()
      .scale(1400)
      .center([14, 42])
      .translate([width / 2, height / 2]);

    const colorScale = d3.scaleThreshold()
      .domain([10, 20, 25, 50, 75, 800])
      .range(d3.schemeReds[6])
      .unknown("white");

    

    const loadGeoJSON = async () => {
      try {
        return await d3.json("./italy-with-regions_1458.geojson");
      } catch (error) {
        console.error('Error loading GeoJSON data:', error);
        throw error;
      }
    };
    
    const loadCSV = async () => {
      try {
        return await d3.csv("./years_no2/dati_2002.csv");
      } catch (error) {
        console.error('Error loading CSV data:', error);
        throw error;
      }
    };

    const regionMeans = {};
    const provinciaMeans = {};

    const loadData = async () => {
      try {
        const topo = await loadGeoJSON();
        const csvData = await loadCSV();
    
        const regionData = {};
        const provinciaData = {};
        
        csvData.forEach(d => {
          const region = d.Regione;
          const provincia = d.Provincia;
    
          if (!regionData[region]) {
            regionData[region] = [];
          }
          regionData[region].push(+d.media_yy);
    
          if (!provinciaData[provincia]) {
            provinciaData[provincia] = [];
          }
          provinciaData[provincia].push(+d.media_yy);
        });
    
        Object.keys(provinciaData).forEach(provincia => {
          const values = provinciaData[provincia];
          const mean = d3.mean(values);
          provinciaMeans[provincia] = mean ? mean.toFixed(2) : '0';
        });

        console.log(provinciaData)
    
        Object.keys(regionData).forEach(region => {
          const values = regionData[region];
          const mean = d3.mean(values);
          regionMeans[region] = mean ? mean.toFixed(2) : '0';
        });
    
        provinciaDataRef.current = await d3.json("./limits_IT_provinces.geojson");
    
        ready(null, topo, regionMeans);
        
      } catch (error) {
        console.error('Error loading data:', error);
        ready(error);
      }
    };

    
    

    

    const mouseOverRegion = function (event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .style("opacity", 1)
        .style("stroke", "black");

      tooltip.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip.html(`Region: ${d.properties.name}<br>Mean: ${regionMeans[d.properties.name]}<br>Year: 2010`)
        .style("left", (event.pageX + 5) + "px")
        .style("top", (event.pageY - 28) + "px");
    };

    const mouseLeaveRegion = function () {
      d3.select(this)
        .transition()
        .duration(200)
        .style("opacity", .8)
        .style("stroke", "none");

      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    };

    const mouseOverprovincia = function (event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .style("opacity", 1)
        .style("stroke", "none");

      tooltip.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip.html(`Provincia: ${d.properties.prov_name}<br>Value: ${provinciaMeans[d.properties.prov_name]}<br>Year: 2010`)
        .style("left", (event.pageX + 5) + "px")
        .style("top", (event.pageY - 28) + "px");
    };

    const mouseLeaveprovincia = function () {
      d3.select(this)
        .transition()
        .duration(200)
        .style("opacity", .8)
        .style("stroke", "none");

      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    };

    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on("zoom", (event) => {
        svg.selectAll('path')
          .attr("transform", event.transform);
      });

      const updateMap = (features, isProvincia = true, reset = false) => {
        if (!Array.isArray(features)) {
          console.error('Features is not an array:', features);
          // Gestisci l'errore o reimposta features a un valore predefinito
          // Ad esempio, features = [];
          return;
        }
      
        d3.select(svgRef.current).selectAll('*').remove();
        console.log(features)
      
        svg.selectAll("path")
          .data(features)
          .enter().append("path")
          .attr("class", isProvincia ? "provincia" : "regione")
          .attr("d", path.projection(projection))
          .style("fill", d => isProvincia ? colorScale(provinciaMeans[d.properties.mean_value]) : colorScale(regionMeans[d.properties.name] || 0))
          .style("stroke", "none")
          .style("opacity", .8)
          .on("mouseover", isProvincia ? mouseOverprovincia : mouseOverRegion)
          .on("mouseleave", isProvincia ? mouseLeaveprovincia : mouseLeaveRegion)
          .on("click", isProvincia ? null : clickRegion);
      
        svg.selectAll("path").each(function(d) {
          console.log(`Province: ${d.properties.prov_name}, Color: ${d3.select(this).style("fill")}`);
        });
      
        if (!reset && isProvincia) {
          const bounds = calculateTotalBounds(features);
      
          const dx = bounds[1][0] - bounds[0][0];
          const dy = bounds[1][1] - bounds[0][1];
          const x = (bounds[0][0] + bounds[1][0]) / 2;
          const y = (bounds[0][1] + bounds[1][1]) / 2;
          const scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height)));
          const translate = [width / 2 - scale * x, height / 2 - scale * y];
      
          svg.transition().duration(750).call(
            zoom.transform,
            d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
          );
        }
      };

    const calculateTotalBounds = (features) => {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

      features.forEach(feature => {
        const bounds = path.bounds(feature);

        minX = Math.min(minX, bounds[0][0]);
        minY = Math.min(minY, bounds[0][1]);
        maxX = Math.max(maxX, bounds[1][0]);
        maxY = Math.max(maxY, bounds[1][1]);
      });

      return [[minX, minY], [maxX, maxY]];
    };

    const regionNameMapping = {
      "Valle d'Aosta": "Valle d'Aosta/Vall\u00e9e d'Aoste",
      "Trentino-Alto Adige": "Trentino-Alto Adige/S\u00fcdtirol",
      "Friuli Venezia Giulia": "Friuli-Venezia Giulia",
      "Aosta": "Valle d'Aosta/Vall\u00e9e d'Aoste"
      // Aggiungi altri nomi secondo necessità
    };

    const clickRegion = function (event, d) {
      if (!hasClickedRegion){
      const region = regionNameMapping[d.properties.name] || d.properties.name;
      //setSelectedRegion(region);
      const provinciaFeatures = provinciaDataRef.current.features;

      const provinciaInRegion = provinciaFeatures.filter(feature => {
        return feature.properties && feature.properties.reg_name === region;
      });
     

      updateMap(provinciaInRegion, true);
      setSelectedRegion(region)
      setHasClickedRegion(true);
    }
    };

    const ready = (error, topo, data) => {
      if (error) {
        throw error;
      }

      initialFeaturesRef.current = topo.features;

      svg.call(zoom);

      if (!selectedRegion && !hasClickedRegion) {
        updateMap(initialFeaturesRef.current, false, true);
      }

      createLegend(colorScale);
    };

    const resetZoom = () => {
      setSelectedRegion(null);
      setHasClickedRegion(false);
      svg.transition().duration(750).call(
        zoom.transform,
        d3.zoomIdentity
      );
      updateMap(initialFeaturesRef.current, false, true);
    };

    if (selectedRegion && !hasClickedRegion) {
      const region = regionNameMapping[selectedRegion] || selectedRegion;
      const provinciaInRegion = provinciaDataRef.current.features.filter(feature => {
        return feature.properties.reg_name === region;
      });
      

      console.log(provinciaInRegion)

      updateMap(provinciaInRegion, true);
      setHasClickedRegion(true);
    } else if (!hasClickedRegion) {
      resetZoom();
    }

    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

      const createLegend = (colorScale) => {
        const legendWidth = 100;
        const legendHeight = 140;
        const keys = colorScale.range().map((d, i) => {
          const extent = colorScale.invertExtent(d);
          if (extent[0] === undefined) {
            extent[0] = 0;
          }
          return {
            color: d,
            label: `${extent[0]} - ${extent[1]}`
          };
        });
  
        const legendSvg = d3.select(legendRef.current)
          .attr("width", legendWidth)
          .attr("height", legendHeight)
          .style("position", "absolute")
          .style("bottom", "5px")
          .style("right", "10px")
          .style("padding", "5px")
          .style("border-radius", "5px")
          .style("box-shadow", "0 0 10px rgba(0,0,0,0.2)");
  
        const size = 10;
  
        legendSvg.selectAll("mydots")
          .data(keys)
          .enter()
          .append("rect")
          .attr("x", 10)
          .attr("y", (d, i) => 30 + (i + 1) * (size + 5))
          .attr("width", size)
          .attr("height", size)
          .style("fill", d => d.color);
  
        legendSvg.selectAll("mylabels")
          .data(keys)
          .enter()
          .append("text")
          .attr("x", 10 + size * 1.2)
          .attr("y", (d, i) => 30 + (i +1) * (size + 5) + (size / 2))
          .style("fill", d => d.color)
          .text(d => d.label)
          .attr("text-anchor", "left")
          .style("alignment-baseline", "middle");
  
        legendSvg.append("rect")
          .attr("x", 10)
          .attr("y", 30 + (0) * (size + 5))
          .attr("width", size)
          .attr("height", size)
          .style("fill", "white");
  
        legendSvg.append("text")
          .attr("x", 10 + size * 1.2)
          .attr("y", 30 + (0) * (size + 5) + (size / 2))
          .text("undefined")
          .style("fill", "white")
          .attr("text-anchor", "left")
          .style("alignment-baseline", "middle");
  
          legendSvg.append("text")
          .attr("x", 10)
          .attr("y", 15)
          .text("NO2(µg/m³)")
          .attr("fill", "white")
          .style("font-size", "12px");

      }
    loadData();

    
  }, [selectedRegion, setSelectedRegion, hasClickedRegion]);

  return (
    <div style={{ height: '350px', width: '640px', overflow: 'hidden', position: 'relative', top: 0, left: 0, marginBottom: '50px'}}>
      <svg ref={svgRef} style={{ position: 'absolute', top: 0, left: 0 }}></svg>
      <svg ref={legendRef} style={{ position: 'absolute', bottom: '10px' }}></svg>
 
      
    </div>
  );
};

export default Map;