import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Map = ({ selectedRegion, setSelectedRegion, pollutant, year }) => {
  const svgRef = useRef();
  const initialFeaturesRef = useRef(null);
  const legendRef = useRef();
  const tooltipRef = useRef();
  const provinciaDataRef = useRef();
  const [hasClickedRegion, setHasClickedRegion] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false); // Stato per verificare se i dati sono caricati

  useEffect(() => {
    const margin = { top: 0, right: 20, bottom: 0, left: 40 };
    const width = 440 - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const path = d3.geoPath();
    const projection = d3.geoMercator()
      .scale(1400)
      .center([14, 42])
      .translate([width / 2, height / 2]);

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
        return d3.scaleOrdinal()
          .domain(['Good', 'Fair', 'Moderate', 'Poor', 'Very poor', 'Extremely poor']) // Example domain
          .range(d3.schemeReds[6]) // Example range
          .unknown("white");
      }
    };

    const colorScale = getColorScale(pollutant);

    const regionMeans = {};
    const provinciaMeans = {};
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
        return await d3.csv(`./years${pollutant}/dati_${year}.csv`);
      } catch (error) {
        console.error('Error loading CSV data:', error);
        throw error;
      }
    };

    const regionData = {};
        const provinciaData = {};

    const loadData = async () => {
      try {
        const topo = await loadGeoJSON();
        const csvData = await loadCSV();

        

        const categorizeValue = (value, pollutant) => {
          if (pollutant === 'NO2') {
            if (value == 'undefined') return 'undefined'
            if (value <= 40) return 'Good';
            if (value <= 90) return 'Fair';
            if (value <= 120) return 'Moderate';
            if (value <= 230) return 'Poor';
            if (value <= 340) return 'Very poor';
            if (value <= 800) return 'Extremely poor';
            return 'undefined'
          } else if (pollutant === 'PM10') {
            if (value == 'undefined') return 'undefined'
            if (value <= 20) return 'Good';
            if (value <= 40) return 'Fair';
            if (value <= 50) return 'Moderate';
            if (value <= 100) return 'Poor';
            if (value <= 150) return 'Very poor';
            if (value <= 800) return 'Extremely poor';
            return 'undefined'
          } else if (pollutant === 'PM25') {
            if (value == 'undefined') return 'undefined'
            if (value <= 10) return 'Good';
            if (value <= 20) return 'Fair';
            if (value <= 25) return 'Moderate';
            if (value <= 50) return 'Poor';
            if (value <= 75) return 'Very poor';
            if (value <= 800) return 'Extremely poor';
            return 'undefined'
          } else if (pollutant === 'O3') {
            if (value == 'undefined') return 'undefined'
            if (value <= 50) return 'Good';
            if (value <= 100) return 'Fair';
            if (value <= 130) return 'Moderate';
            if (value <= 240) return 'Poor';
            if (value <= 380) return 'Very poor';
            if (value <= 800) return 'Extremely poor';
            return 'undefined'
          }
          return 'undefined';
        };


        csvData.forEach(d => {
          const region = d.Regione;
          const provincia = d.Provincia;

          if (pollutant == '_total') {
            
            
            const media_yy_pm10 = +d.pm10;
            
            
            const media_yy_pm25 = +d.pm25;
            const media_yy_no2 = +d.no2;
            const media_yy_o3 = +d.o3;

            // Aggiungi le medie a regionData per ciascun agente inquinante
            if (!regionData[region]) {
              regionData[region] = {
                PM10: [],
                PM25: [],
                NO2: [],
                O3: []
              };
            }

            if (media_yy_pm10 !== 0) {
              regionData[region].PM10.push(media_yy_pm10);
          }
          if ( media_yy_pm25 !== 0) {
              regionData[region].PM25.push(media_yy_pm25);
          }
          if (media_yy_no2 !== 0) {
              regionData[region].NO2.push(media_yy_no2);
          }
          if (media_yy_o3 !== 0) {
              regionData[region].O3.push(media_yy_o3);
          }

            
          
            if (!provinciaData[provincia]) {
              provinciaData[provincia] = {
                PM10: [],
                PM25: [],
                NO2: [],
                O3: []
              };
            }
            if (media_yy_pm10 !== 0) {
              provinciaData[provincia].PM10.push(media_yy_pm10);
          }
          if ( media_yy_pm25 !== 0) {
            provinciaData[provincia].PM25.push(media_yy_pm25);
          }
          if (media_yy_no2 !== 0) {
            provinciaData[provincia].NO2.push(media_yy_no2);
          }
          if (media_yy_o3 !== 0) {
            provinciaData[provincia].O3.push(media_yy_o3);
          }


      }
          else {

  if (!regionData[region]) {
    regionData[region] = [];
  }
  regionData[region].push(+d.media_yy);

  if (!provinciaData[provincia]) {
    provinciaData[provincia] = [];
  }
  provinciaData[provincia].push(+d.media_yy);

  

}
        });

if (pollutant !== '_total') {

  Object.keys(provinciaData).forEach(provincia => {
    const values = provinciaData[provincia];
    if (values.length > 0) {
      const mean = d3.mean(values);
      provinciaMeans[provincia] = mean.toFixed(2);
    } else {
      provinciaMeans[provincia] = undefined;
    }
  });

  Object.keys(regionData).forEach(region => {
    const values = regionData[region];
    if (values.length > 0) {
      const mean = d3.mean(values);
      regionMeans[region] = mean.toFixed(2);
    } else {
      regionMeans[region] = undefined;
    }
  })
}

else {
  Object.keys(regionData).forEach(region => {
    const meanPM10 = d3.mean(regionData[region].PM10);
    const meanPM2_5 = d3.mean(regionData[region].PM25);
    const meanNO2 = d3.mean(regionData[region].NO2);
    const meanO3 = d3.mean(regionData[region].O3);
  
    // Categorizza le medie
    const worstCategory = [
      { category: meanPM10 !== null ? categorizeValue(meanPM10, 'PM10') : null, pollutant: 'PM10' },
      { category: meanPM2_5 !== null ? categorizeValue(meanPM2_5, 'PM25') : null, pollutant: 'PM25' },
      { category: meanNO2 !== null ? categorizeValue(meanNO2, 'NO2') : null, pollutant: 'NO2' },
      { category: meanO3 !== null ? categorizeValue(meanO3, 'O3') : null, pollutant: 'O3' }
    ].reduce((prev, current) => {
      const order = ['Good', 'Fair', 'Moderate', 'Poor', 'Very poor', 'Extremely poor'];
      
      // Se il current.category è null, manteniamo il prev
      if (current.category === null) {
        return prev;
      }
      
      // Se prev.category è null, passiamo al current
      if (prev.category === null) {
        return current;
      }
      
      // Confrontiamo le categorie
      return order.indexOf(current.category) > order.indexOf(prev.category) ? current : prev;
    });
    // Assegna la categoria peggiore e l'inquinante corrispondente a regionMeans
    regionMeans[region] = {
      category: worstCategory.category,
      pollutant: worstCategory.pollutant
    };

    console.log(meanPM2_5)
    
    
  });

  Object.keys(provinciaData).forEach(provincia => {
    const meanPM10 = d3.mean(provinciaData[provincia].PM10.filter(d => d !== null));
const meanPM2_5 = d3.mean(provinciaData[provincia].PM25.filter(d => d !== null));
const meanNO2 = d3.mean(provinciaData[provincia].NO2.filter(d => d !== null));
const meanO3 = d3.mean(provinciaData[provincia].O3.filter(d => d !== null));
  
    // Categorizza le medie
    const worstCategory = [
      { category: categorizeValue(meanPM10, 'PM10'), pollutant: 'PM10' },
      { category: categorizeValue(meanPM2_5, 'PM25'), pollutant: 'PM25' },
      { category: categorizeValue(meanNO2, 'NO2'), pollutant: 'NO2' },
      { category: categorizeValue(meanO3, 'O3'), pollutant: 'O3' }
    ].reduce((prev, current) => {
      const order = ['Good', 'Fair', 'Moderate', 'Poor', 'Very poor', 'Extremely poor'];
      return order.indexOf(current.category) > order.indexOf(prev.category) ? current : prev;
    
    });
    // Assegna la categoria peggiore e l'inquinante corrispondente a provinciaMeans
    provinciaMeans[provincia] = {
      category: worstCategory.category,
      pollutant: worstCategory.pollutant
    };
  });


}
console.log(regionData)
provinciaDataRef.current = await d3.json("./limits_IT_provinces.geojson");

initialFeaturesRef.current = topo.features;

setDataLoaded(true); // Imposta lo stato a true dopo il caricamento dei dati

createLegend(colorScale);

// Aggiorna la mappa se i dati sono stati caricati e una regione è selezionata
if (selectedRegion) {
  updateProvinciaMap(selectedRegion);
} else if (!hasClickedRegion) {
  updateMap(initialFeaturesRef.current, false, true);
}
      } catch (error) {
  console.error('Error loading data:', error);
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
  if (pollutant == '_total') {
    const containerRect = svgRef.current.getBoundingClientRect();
    const tooltipWidth = 100
    const tooltipHeight = tooltipRef.current.clientHeight;
  
    tooltip.html(`Region: <b>${d.properties.name}</b><br>Means of pm10: ${d3.mean(regionData[d.properties.name].PM10) && d3.mean(regionData[d.properties.name].PM10) !== undefined ? d3.mean(regionData[d.properties.name].PM10).toFixed(2) : 'undefined'}
    <br>Means of pm2.5: ${d3.mean(regionData[d.properties.name].PM25) && d3.mean(regionData[d.properties.name].PM25) !== undefined ? d3.mean(regionData[d.properties.name].PM25).toFixed(2) : 'undefined'}
    <br>Means of no2: ${d3.mean(regionData[d.properties.name].NO2) && d3.mean(regionData[d.properties.name].NO2)!== undefined ? d3.mean(regionData[d.properties.name].NO2).toFixed(2) : 'undefined'}
    <br>Means of o3: ${d3.mean(regionData[d.properties.name].O3) && d3.mean(regionData[d.properties.name].O3) !== undefined ? d3.mean(regionData[d.properties.name].O3.filter(d => d !== null)).toFixed(2) : 'undefined'}
    <br> ${regionMeans[d.properties.name] && regionMeans[d.properties.name].category}  ${regionMeans[d.properties.name] && 'due to:' + regionMeans[d.properties.name].pollutant}
    <br>Year: 2010`)
    .style("left", `${containerRect.left - 10}px`)
    .style("top", `${containerRect.top - 50}px`)
    .style("font-size", "12px")
    .style("text-align", "right");
      
  }
  else {
    const containerRect = svgRef.current.getBoundingClientRect();
    const tooltipWidth = tooltipRef.current.clientWidth;
    const tooltipHeight = tooltipRef.current.clientHeight;
    tooltip.html(`Region: <b>${d.properties.name}</b><br>Mean: ${regionMeans[d.properties.name]}<br>Year: 2010`)
    .style("left", `${containerRect.left - 10}px`)
    .style("top", `${containerRect.top - 50}px`)
    .style("font-size", "12px")
    .style("text-align", "right");

  }

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

  const containerRect = svgRef.current.getBoundingClientRect();
  const tooltipWidth = tooltipRef.current.clientWidth;
  const tooltipHeight = tooltipRef.current.clientHeight;

  d3.select(this)
    .transition()
    .duration(200)
    .style("opacity", 1)
    .style("stroke", "none");

  tooltip.transition()
    .duration(200)
    .style("opacity", .9);
  if (pollutant == '_total') {
    tooltip.html(`Provincia: <b>${d.properties.prov_name}</b> ${d3.mean(provinciaData[d.properties.prov_name].PM10) && d3.mean(provinciaData[d.properties.prov_name].PM10) !== undefined ? '<br>Means of pm10: ' + d3.mean(provinciaData[d.properties.prov_name].PM10).toFixed(2) : ''}
    ${d3.mean(provinciaData[d.properties.prov_name].PM25) && d3.mean(provinciaData[d.properties.prov_name].PM25) !== undefined ? '<br>Means of pm2.5: ' + d3.mean(provinciaData[d.properties.prov_name].PM25).toFixed(2) : ''}
    ${d3.mean(provinciaData[d.properties.prov_name].NO2) && d3.mean(provinciaData[d.properties.prov_name].NO2) !== undefined ? '<br> Means of no2: ' + d3.mean(provinciaData[d.properties.prov_name].NO2).toFixed(2) : ''}
     ${d3.mean(provinciaData[d.properties.prov_name].O3) && d3.mean(provinciaData[d.properties.prov_name].O3) !== undefined ? '<br>Means of o3: ' + d3.mean(provinciaData[d.properties.prov_name].O3).toFixed(2) : ''}
     ${provinciaMeans[d.properties.prov_name] && provinciaMeans[d.properties.prov_name] !== undefined ? '<br>' + provinciaMeans[d.properties.prov_name].category : ''}  ${provinciaMeans[d.properties.prov_name] && provinciaMeans[d.properties.prov_name] !== undefined ? 'due to:' + provinciaMeans[d.properties.prov_name].pollutant : ''}
    <br>Year: 2010`)
    .style("left", `${containerRect.left - 10}px`)
    .style("top", `${containerRect.top - 50}px`)
    .style("font-size", "12px")
    .style("text-align", "right");
  }
  else {
    
    tooltip.html(`Provincia: <b>${d.properties.prov_name}</b><br>Mean: ${provinciaMeans[d.properties.prov_name]}<br>Year: 2010`)
    .style("left", `${containerRect.left - 10}px`)
    .style("top", `${containerRect.top - 50}px`)
    .style("font-size", "12px")
    .style("text-align", "right");

  }

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

  svg.selectAll("path").remove();
  if (!isProvincia) {
    if (!Array.isArray(features)) {
      console.error('Features is not an array:', features);
      // Gestisci l'errore o reimposta features a un valore predefinito
      features = [];
      return;
    }
  }

  svg.selectAll("path")
    .data(features)
    .enter().append("path")
    .attr("class", isProvincia ? "provincia" : "regione")
    .attr("d", path.projection(projection))
    .style("fill", d => {

      if (pollutant == '_total') {
        const meanValue = isProvincia ? provinciaMeans[d.properties.prov_name] : regionMeans[d.properties.name];

        return meanValue !== undefined ? colorScale(meanValue.category) : "white";
      }
      else {
        const meanValue = isProvincia ? provinciaMeans[d.properties.prov_name] : regionMeans[d.properties.name];
        return meanValue !== undefined ? colorScale(meanValue) : "white";
      }

    })
    .style("stroke", "none")
    .style("opacity", .8)
    .on("mouseover", isProvincia ? mouseOverprovincia : mouseOverRegion)
    .on("mouseleave", isProvincia ? mouseLeaveprovincia : mouseLeaveRegion)
    .on("click", isProvincia ? null : clickRegion);

  if (isProvincia) {
    setHasClickedRegion(true)
  }

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
  const region = regionNameMapping[d.properties.name] || d.properties.name;
  setSelectedRegion(region);
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

const tooltip = d3.select(tooltipRef.current);

const createLegend = (colorScale) => {
  const legendWidth = 100;
  const legendHeight = 140;

  let keys;

  if (pollutant == '_total') {
    keys = colorScale.domain().map((category) => {
      return {
        color: colorScale(category),
        label: category
      }
    });
  }



  else {
    keys = colorScale.range().map((d, i) => {
      const extent = colorScale.invertExtent(d);
      if (extent[0] === undefined) {
        extent[0] = 0;
      }
      return {
        color: d,
        label: `${extent[0]} - ${extent[1]}`
      };


    });
  }


  const legendSvg = d3.select(legendRef.current);

  // Rimuovi tutti gli elementi presenti nella legenda prima di aggiungere quelli nuovi
  legendSvg.selectAll("*").remove();

  legendSvg
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
    .attr("y", (d, i) => 30 + (i + 1) * (size + 5) + (size / 2))
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
    .text(pollutant === '_total' ? 'AQI category' : `${pollutant.replace('_', '')}(µg/m³)`)
    .attr("fill", "white")
    .style("font-size", "12px");
};

const updateProvinciaMap = (region) => {
  const provinciaInRegion = provinciaDataRef.current.features.filter(feature => {
    return feature.properties.reg_name === region;
  });

  provinciaInRegion.forEach(prov => {
    prov.properties.mean_value = provinciaMeans[prov.properties.prov_name];
  });

  updateMap(provinciaInRegion, true);
};

if (selectedRegion && dataLoaded) {
  updateProvinciaMap(selectedRegion);
} else {
  resetZoom();
}

loadData();
  }, [selectedRegion, hasClickedRegion, pollutant, year]);

return (
  <div style={{ height: '350px', width: '440px', overflow: 'hidden', position: 'relative', top: 0, left: 0 }}>
    <svg ref={svgRef} style={{ position: 'absolute', top: 0, left: 0 }}></svg>
    <div ref={tooltipRef} style={{ opacity: 0, position: 'relative', height: '100px', width: '152px'}}></div>
    <svg ref={legendRef} style={{ position: 'absolute', bottom: '10px' }}></svg>
  </div>
);
};

export default Map;