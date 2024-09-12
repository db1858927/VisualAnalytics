import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const ScatterPlot = ({ year, onProvinceHover, onProvinceLeave, onProvincesSelect, selectedProvinces, hoveredRegion, hoverProvincia }) => {
  const svgRef = useRef();
  const legendRef = useRef();
  const tooltipRef = useRef(); // Ref per il tooltip
  const [data, setData] = useState([]); // Dati caricati solo una volta
  // const [selectedProvinces, setSelectedProvinces] = useState([]); // Stato per memorizzare le province selezionate

  const provinceToRegionMap = {
    'Agrigento': 'Sicilia',
    'Alessandria': 'Piemonte',
    'Ancona': 'Marche',
    'Aosta': 'Valle d\'Aosta',
    'Arezzo': 'Toscana',
    'Ascoli Piceno': 'Marche',
    'Asti': 'Piemonte',
    'Avellino': 'Campania',
    'Bari': 'Puglia',
    'Barletta-Andria-Trani': 'Puglia',
    'Belluno': 'Veneto',
    'Benevento': 'Campania',
    'Bergamo': 'Lombardia',
    'Biella': 'Piemonte',
    'Bologna': 'Emilia-Romagna',
    'Bolzano': 'Trentino-Alto Adige',
    'Brescia': 'Lombardia',
    'Brindisi': 'Puglia',
    'Cagliari': 'Sardegna',
    'Caltanissetta': 'Sicilia',
    'Campobasso': 'Molise',
    'Caserta': 'Campania',
    'Catania': 'Sicilia',
    'Catanzaro': 'Calabria',
    'Chieti': 'Abruzzo',
    'Como': 'Lombardia',
    'Cosenza': 'Calabria',
    'Cremona': 'Lombardia',
    'Crotone': 'Calabria',
    'Cuneo': 'Piemonte',
    'Enna': 'Sicilia',
    'Fermo': 'Marche',
    'Ferrara': 'Emilia-Romagna',
    'Firenze': 'Toscana',
    'Foggia': 'Puglia',
    'Forlì-Cesena': 'Emilia-Romagna',
    'Frosinone': 'Lazio',
    'Genova': 'Liguria',
    'Gorizia': 'Friuli Venezia Giulia',
    'Grosseto': 'Toscana',
    'Imperia': 'Liguria',
    'Isernia': 'Molise',
    'La Spezia': 'Liguria',
    'L\'Aquila': 'Abruzzo',
    'Latina': 'Lazio',
    'Lecce': 'Puglia',
    'Lecco': 'Lombardia',
    'Livorno': 'Toscana',
    'Lodi': 'Lombardia',
    'Lucca': 'Toscana',
    'Macerata': 'Marche',
    'Mantova': 'Lombardia',
    'Massa-Carrara': 'Toscana',
    'Matera': 'Basilicata',
    'Messina': 'Sicilia',
    'Milano': 'Lombardia',
    'Modena': 'Emilia-Romagna',
    'Monza e Brianza': 'Lombardia',
    'Napoli': 'Campania',
    'Novara': 'Piemonte',
    'Nuoro': 'Sardegna',
    'Oristano': 'Sardegna',
    'Padova': 'Veneto',
    'Palermo': 'Sicilia',
    'Parma': 'Emilia-Romagna',
    'Pavia': 'Lombardia',
    'Perugia': 'Umbria',
    'Pesaro e Urbino': 'Marche',
    'Pescara': 'Abruzzo',
    'Piacenza': 'Emilia-Romagna',
    'Pisa': 'Toscana',
    'Pistoia': 'Toscana',
    'Pordenone': 'Friuli Venezia Giulia',
    'Potenza': 'Basilicata',
    'Prato': 'Toscana',
    'Ragusa': 'Sicilia',
    'Ravenna': 'Emilia-Romagna',
    'Reggio Calabria': 'Calabria',
    'Reggio Emilia': 'Emilia-Romagna',
    'Rieti': 'Lazio',
    'Rimini': 'Emilia-Romagna',
    'Roma': 'Lazio',
    'Rovigo': 'Veneto',
    'Salerno': 'Campania',
    'Sassari': 'Sardegna',
    'Savona': 'Liguria',
    'Siena': 'Toscana',
    'Siracusa': 'Sicilia',
    'Sondrio': 'Lombardia',
    'Sud Sardegna': 'Sardegna',
    'Taranto': 'Puglia',
    'Teramo': 'Abruzzo',
    'Terni': 'Umbria',
    'Torino': 'Piemonte',
    'Trapani': 'Sicilia',
    'Trento': 'Trentino-Alto Adige',
    'Treviso': 'Veneto',
    'Trieste': 'Friuli Venezia Giulia',
    'Udine': 'Friuli Venezia Giulia',
    'Varese': 'Lombardia',
    'Venezia': 'Veneto',
    'Verbano-Cusio-Ossola': 'Piemonte',
    'Vercelli': 'Piemonte',
    'Verona': 'Veneto',
    'Vibo Valentia': 'Calabria',
    'Vicenza': 'Veneto',
    'Viterbo': 'Lazio'
  };

  useEffect(() => {
    // Carica i dati solo al cambio dell'anno
    d3.csv(`./tsne-results/Province/tsne_results_${year}.csv`).then(loadedData => {
      loadedData.forEach(d => {
        d['Component 1'] = +d['Component 1'];
        d['Component 2'] = +d['Component 2'];
      });
      setData(loadedData); // Salva i dati e disegna il grafico
      drawInitialPlot(loadedData); // Disegna il grafico iniziale
    }).catch(error => {
      console.error("Error loading the data:", error);
    });
  }, [year]);

  // Effetto per aggiornare i cerchi selezionati
  useEffect(() => {
    // Aggiorna i cerchi selezionati quando `selectedProvinces` cambia
    updateSelectedCircles(selectedProvinces);
  }, [data,selectedProvinces]);

  const clusters = Array.from(new Set(data.map(d => d.labels))).sort();
  const colorScale = d3.scaleOrdinal()
    .domain(clusters)
    .range([ "#9b59b6", "#ffe135", "#1abc9c"])


  // Funzione per disegnare il grafico solo una volta al caricamento
  const drawInitialPlot = (data) => {
    const margin = { top: 10, right: 30, bottom: 40, left: 50 };
    const width = 400 - margin.left - margin.right;
    const height = 320 - margin.top - margin.bottom;

    const svgElement = d3.select(svgRef.current);
    svgElement.selectAll('*').remove();

    const svg = svgElement
      .append('svg')
      .attr('width', width + margin.left + margin.right + 100)
      .attr('height', height + margin.top + margin.bottom);

    svg.append("defs").append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", width)
      .attr("height", height);
    
    const plotArea = svg.append('g')
      .attr('transform',` translate(${margin.left}, ${margin.top})`)
      .attr("clip-path", "url(#clip)");

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

    const xAxis = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top + height})`)
      .call(d3.axisBottom(x));

    const yAxis = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)
      .call(d3.axisLeft(y));

    const colorScale = d3.scaleOrdinal()
      .domain([...new Set(data.map(d => d.labels))])
      .range(["#9b59b6", "#ffe135", "#1abc9c"]);

    const circles = plotArea.selectAll("circle")
      .data(data)
      .enter().append("circle")
      .attr("cx", d => x(d['Component 1']))
      .attr("cy", d => y(d['Component 2']))
      .attr("r", 5)
      .style("fill", d => colorScale(d['labels']))
      .style("opacity", d => selectedProvinces.includes(d['Provincia']) ? 1 : 0.8)
      .style("stroke", d => selectedProvinces.includes(d['Provincia']) ? "lightgray" : "none")
      .style("stroke-width", d => selectedProvinces.includes(d['Provincia']) ? "2px" : "0px")
      .on("mouseover", function (event, d) {
        d3.select(this).transition().attr("r", 7)
        .style("stroke",  "lightgray" )
        .style("stroke-width", "2px" )
        ;
        labels.filter(label => label['Provincia'] === d['Provincia']).transition().style("opacity", 0.8);
        onProvinceHover(d['Provincia']);
      })
      .on("mouseout", function (event, d) {
        if (!selectedProvinces.includes(d['Provincia'])) {
          d3.select(this).transition().attr("r", 5)
          .style("stroke",  "none" )
        .style("stroke-width", "0px" );
          labels.filter(label => label['Provincia'] === d['Provincia']).transition().style("opacity", 0);
        }
        onProvinceLeave();
      })
      .on("click", function (event, d) {
        // Aggiorna lo stato selectedProvinces
        onProvincesSelect((prevSelectedProvinces) => {
          const isSelected = prevSelectedProvinces.includes(d['Provincia']);
          let newSelection;
      
          if (isSelected) {
            // Rimuovi la provincia se è già selezionata
            newSelection = prevSelectedProvinces.filter(p => p !== d['Provincia']);
          } else {
            // Aggiungi la provincia se non è selezionata
            newSelection = [...prevSelectedProvinces, d['Provincia']];
          }
      
          // Aggiorna la selezione esternamente
          onProvincesSelect(newSelection);
      
          // Aggiorna il tooltip immediatamente con la nuova selezione
          d3.select(tooltipRef.current).html(`Selected provinces: ${newSelection.join(", ")}`);
          
          // Restituisci il nuovo stato
          return newSelection;
        });
      });
    const labels = svg.selectAll("text.label")
      .data(data)
      .enter().append("text")
      .attr("x", d => x(d['Component 1']) + 8)
      .attr("y", d => y(d['Component 2']) + 2)
      .text(d => d['Provincia'])
      .style("font-size", "12px")
      .style("fill", "white")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .attr("class", "label");

    const zoom = d3.zoom()
      .scaleExtent([0.5, 10])
      .extent([[0, 0], [width, height]])
      .on('zoom', (event) => {
        const transform = event.transform;
        const newX = transform.rescaleX(x);
        const newY = transform.rescaleY(y);

        xAxis.call(d3.axisBottom(newX));
        yAxis.call(d3.axisLeft(newY));

        circles
          .attr('cx', d => newX(d['Component 1']))
          .attr('cy', d => newY(d['Component 2']));
      });

    svgElement.call(zoom);

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
    
  };

  // Evidenzia i punti delle province appartenenti alla regione selezionata
 

  

  // Funzione per aggiornare solo i cerchi selezionati
  const updateSelectedCircles = (newSelection) => {
    d3.select(svgRef.current)
      .selectAll("circle")
      .style("stroke", d => newSelection.includes(d['Provincia']) ? "#d3d3d3" : "none")
      .style("stroke-width", d => newSelection.includes(d['Provincia']) ? "2px" : "0px")
      .style("opacity", d => newSelection.includes(d['Provincia']) ? 1 : 0.8)
      .transition().attr("r", d => newSelection.includes(d['Provincia']) ? 7 : 5);
  };

  useEffect(() => {
    const svg = d3.select(svgRef.current);
  
    console.log("Hovered region:", hoverProvincia);  // Verifica che hoveredRegion sia corretto
    svg.selectAll("circle")
      .transition()
      .duration(200)
      .attr("r", d => {
        // Verifica sia la regione che la provincia
        if (d.Provincia === hoverProvincia || provinceToRegionMap[d.Provincia] === hoveredRegion) {
          return 7; // Dimensione cerchio più grande se corrisponde
        } 
        return 5; // Dimensione standard altrimenti
      })
      .style("opacity", d => {
        // Maggiore opacità per i punti corrispondenti alla regione o alla provincia
        if (d.Provincia === hoverProvincia || provinceToRegionMap[d.Provincia] === hoveredRegion) {
          return 1;
        }
        return 0.5;
      })
      .style("stroke", d => {
        // Bordo per i punti corrispondenti alla regione o provincia
        if (d.Provincia === hoverProvincia || provinceToRegionMap[d.Provincia] === hoveredRegion) {
          return "#d3d3d3"; // Colore del bordo per quelli selezionati
        }
        return "none"; // Nessun bordo altrimenti
      })
      .style("stroke-width", d => {
        // Spessore del bordo per i punti corrispondenti
        if (d.Provincia === hoverProvincia || provinceToRegionMap[d.Provincia] === hoveredRegion) {
          return "2px";
        }
        return "0px"; // Nessun bordo per gli altri
      });
  }, [hoveredRegion, hoverProvincia]);
  

  return (
    <div style={{ display: 'flex' }}>
      <svg ref={svgRef} style={{ height: '350px', width: '400px', overflow: 'visible' }}></svg>
      <svg ref={legendRef} style={{ position: 'absolute', bottom: '20px' }}></svg>
      {selectedProvinces.length > 0 && (
        <div
          ref={tooltipRef}
          style={{
            padding: '10px',
            marginLeft: '10px',
            textSize: '10px',
            borderRadius: '5px',
            maxHeight: '200px',
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            width: '150px',
            marginTop: '120px'
          }}
        >
          Selected provinces: {selectedProvinces.join(", ")}
        </div>
      )}
    </div>
  );
};

export default ScatterPlot;
