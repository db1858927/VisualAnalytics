import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { pink } from '@mui/material/colors';
import Checkbox from '@mui/material/Checkbox';

const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

const ScatterPlot = ({ year, pollutant, setHoveredProvincia, onProvincesSelect, selectedProvinces, hoveredRegion, hoverProvincia }) => {
  const svgRef = useRef();
  const legendRef = useRef();
  const tooltipRef = useRef(); // Ref per il tooltip
  const [data, setData] = useState([]); // Dati caricati solo una volta
  const [showHigh, setShowHigh] = useState(true);
  const [showMid, setShowMid] = useState(true);
  const [showLow, setShowLow] = useState(true);
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

  const updateColors = () => {
    const svg = d3.select(svgRef.current);

    svg.selectAll("circle")
      .style("fill", d => {

        if (pollutant == '_pm10') {
          if (d.pm10 > 50 && showHigh) return "#9C29AD"; // Livelli alti di PM10
          if (d.pm10 <= 50 && d.pm10 > 20 && showMid) return "#8AC3EF"; // Livelli medi di PM10
          if (d.pm10 <= 20 && showLow) return "#65BB6F"; // Livelli bassi di PM10
          return "white"; // Non mostrare se non selezionato
        }
        else if (pollutant == '_pm25') {
          if (d.pm25 > 25 && showHigh) return "#9C29AD"; // Livelli alti di PM10
          if (d.pm25 <= 25 && d.pm25 > 10 && showMid) return "#8AC3EF"; // Livelli medi di PM10
          if (d.pm25 <= 10 && showLow) return "#65BB6F"; // Livelli bassi di PM10
          return "white"; // Non mostrare se non selezionato
        }
        else if (pollutant == '_no2') {
          if (d.no2 > 120 && showHigh) return "#9C29AD"; // Livelli alti di PM10
          if (d.no2 <= 120 && d.no2 > 90 && showMid) return "#8AC3EF"; // Livelli medi di PM10
          if (d.no2 <= 90 && showLow) return "#65BB6F"; // Livelli bassi di PM10
          return "white"; // Non mostrare se non selezionato
        }
        else if (pollutant == '_o3') {
          if (d.o3 > 130 && showHigh) return "#9C29AD"; // Livelli alti di PM10
          if (d.o3 <= 130 && d.o3 > 50 && showMid) return "#8AC3EF"; // Livelli medi di PM10
          if (d.o3 <= 50 && showLow) return "#65BB6F"; // Livelli bassi di PM10
          return "white"; // Non mostrare se non selezionato
        }
        else if (pollutant == '_total') {

          if (d.o3 > 130 && showHigh) return "#9C29AD"; // Livelli alti di PM10
          if (d.o3 <= 130 && d.o3 > 50 && showMid) return "#8AC3EF"; // Livelli medi di PM10
          if (d.o3 <= 50 && showLow) return "#65BB6F"; // Livelli bassi di PM10
          return "white"; // Non mostrare se non selezionato
        }


      })

  };




  useEffect(() => {
    // Carica i dati solo al cambio dell'anno
    d3.csv(`./tsne-results/Province/tsne_results_${year}.csv`).then(loadedData => {
      loadedData.forEach(d => {
        d['Axis 1'] = +d['Axis 1'];
        d['Axis 2'] = +d['Axis 2'];
      });
      setData(loadedData); // Salva i dati e disegna il grafico
      drawInitialPlot(loadedData); // Disegna il grafico iniziale
    }).catch(error => {
      console.error("Error loading the data:", error);
    });


    // Effetto per aggiornare i cerchi selezionati


    const clusters = Array.from(new Set(data.map(d => d.labels))).sort();
    const colorScale = d3.scaleOrdinal()
      .domain(clusters)
      .range(["#9b59b6", "#ffe135", "#1abc9c"])


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
        .attr('transform', ` translate(${margin.left}, ${margin.top})`)
        .attr("clip-path", "url(#clip)");

      const xExtent = d3.extent(data, d => d['Axis 1']);
      const yExtent = d3.extent(data, d => d['Axis 2']);
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

        function calculateWorstPollutant(no2, o3, pm10, pm25) {
          // Limiti standard europei per gli inquinanti
          const limits = {
            no2: 40,   // µg/m³
            o3: 120,   // µg/m³
            pm10: 40,  // µg/m³
            pm25: 25   // µg/m³
          };
        
          // Calcola la percentuale di superamento rispetto al limite
          const pollutantRatios = {
            no2: no2 / limits.no2,
            o3: o3 / limits.o3,
            pm10: pm10 / limits.pm10,
            pm25: pm25 / limits.pm25
          };
        
          // Trova l'inquinante con la percentuale di superamento maggiore
          const worstPollutant = Object.keys(pollutantRatios).reduce((a, b) =>
            pollutantRatios[a] > pollutantRatios[b] ? a : b
          );
        
          return worstPollutant
        }



      const circles = plotArea.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", d => x(d['Axis 1']))
        .attr("cy", d => y(d['Axis 2']))
        .attr("r", 5)
        .style("fill", d => {
          if (pollutant == '_pm10') {
            if (d.pm10 > 50 && showHigh) return "#9C29AD"; // Livelli alti di PM10
            if (d.pm10 <= 50 && d.pm10 > 20 && showMid) return "#8AC3EF"; // Livelli medi di PM10
            if (d.pm10 <= 20 && showLow) return "#65BB6F"; // Livelli bassi di PM10
            return "white"; // Non mostrare se non selezionato
          }
          else if (pollutant == '_pm25') {
            if (d.pm25 > 25 && showHigh) return "#9C29AD"; // Livelli alti di PM10
            if (d.pm25 <= 25 && d.pm25 > 10 && showMid) return "#8AC3EF"; // Livelli medi di PM10
            if (d.pm25 <= 10 && showLow) return "#65BB6F"; // Livelli bassi di PM10
            return "white"; // Non mostrare se non selezionato
          }
          else if (pollutant == '_no2') {
            if (d.no2 > 120 && showHigh) return "#9C29AD"; // Livelli alti di PM10
            if (d.no2 <= 120 && d.no2 > 90 && showMid) return "#8AC3EF"; // Livelli medi di PM10
            if (d.no2 <= 90 && showLow) return "#65BB6F"; // Livelli bassi di PM10
            return "white"; // Non mostrare se non selezionato
          }
          else if (pollutant == '_o3') {
            if (d.o3 > 130 && showHigh) return "#9C29AD"; // Livelli alti di PM10
            if (d.o3 <= 130 && d.o3 > 50 && showMid) return "#8AC3EF"; // Livelli medi di PM10
            if (d.o3 <= 50 && showLow) return "#65BB6F"; // Livelli bassi di PM10
            return "white"; // Non mostrare se non selezionato
          }
          else{
            const wpoll = calculateWorstPollutant(d.no2,d.o3,d.pm10,d.pm25)
            if (wpoll == '_pm10') {
              if (d.pm10 > 50 && showHigh) return "#9C29AD"; // Livelli alti di PM10
              if (d.pm10 <= 50 && d.pm10 > 20 && showMid) return "#8AC3EF"; // Livelli medi di PM10
              if (d.pm10 <= 20 && showLow) return "#65BB6F"; // Livelli bassi di PM10
              return "white"; // Non mostrare se non selezionato
            }
            else if (wpoll == '_pm25') {
              if (d.pm25 > 25 && showHigh) return "#9C29AD"; // Livelli alti di PM10
              if (d.pm25 <= 25 && d.pm25 > 10 && showMid) return "#8AC3EF"; // Livelli medi di PM10
              if (d.pm25 <= 10 && showLow) return "#65BB6F"; // Livelli bassi di PM10
              return "white"; // Non mostrare se non selezionato
            }
            else if (wpoll == '_no2') {
              if (d.no2 > 120 && showHigh) return "#9C29AD"; // Livelli alti di PM10
              if (d.no2 <= 120 && d.no2 > 90 && showMid) return "#8AC3EF"; // Livelli medi di PM10
              if (d.no2 <= 90 && showLow) return "#65BB6F"; // Livelli bassi di PM10
              return "white"; // Non mostrare se non selezionato
            }
            else if (wpoll == '_o3') {
              if (d.o3 > 130 && showHigh) return "#9C29AD"; // Livelli alti di PM10
              if (d.o3 <= 130 && d.o3 > 50 && showMid) return "#8AC3EF"; // Livelli medi di PM10
              if (d.o3 <= 50 && showLow) return "#65BB6F"; // Livelli bassi di PM10
              return "white"; // Non mostrare se non selezionato
            }
           
          }

        })
        .style("opacity", d => selectedProvinces.includes(d['Provincia']) ? 1 : 0.8)
        .attr("r", d => selectedProvinces.includes(d['Provincia']) ? 7 : 5) // Modifica la dimensione
        .style("stroke", d => selectedProvinces.includes(d['Provincia']) ? "red" : "none") // Modifica il colore del bordo
        .style("stroke-width", d => selectedProvinces.includes(d['Provincia']) ? "0.8px" : "0px")


        // Evento mouseover (per evidenziare il cerchio solo se non è selezionato)
        .on("mouseover", function (event, d) {
          if (!selectedProvinces.includes(d['Provincia'])) {
            d3.select(this)
              .transition()
              .attr("r", 7)  // Ingrandisci il cerchio
              .style("stroke", "red")  // Aggiungi il bordo
              .style("stroke-width", "0.8px");

            // Mostra l'etichetta solo se il cerchio non è selezionato
            labels.filter(label => label['Provincia'] === d['Provincia'])
              .transition()
              .style("opacity", 0.8);
          }

          // Aggiungi qualsiasi altra logica su mouseover
          setHoveredProvincia(d['Provincia']);
        })
        .on("mouseout", function (event, d) {
          // Se la provincia è selezionata, non cambiare lo stile
          if (!selectedProvinces.includes(d['Provincia'])) {
            d3.select(this)
              .transition()
              .attr("r", 5)  // Torna alla dimensione normale solo se non è selezionata
              .style("stroke", "none")  // Rimuovi il bordo solo se non è selezionata
              .style("stroke-width", "0px")
              .style("opacity", 0.8);  // Torna all'opacità standard
          }
        
          // Nascondi l'etichetta solo se la provincia non è selezionata
          labels.filter(label => label['Provincia'] === d['Provincia'])
            .transition()
            .style("opacity", 0);
        
          setHoveredProvincia(null);
        })

        // Evento click (gestisce la selezione)
        .on("click", function (event, d) {
          onProvincesSelect((prevSelectedProvinces) => {
            const isSelected = prevSelectedProvinces.includes(d['Provincia']);
            let newSelection;
        
            if (isSelected) {
              // Rimuovi la provincia selezionata
              newSelection = prevSelectedProvinces.filter(p => p !== d['Provincia']);
            } else {
              // Aggiungi la provincia selezionata
              newSelection = [...prevSelectedProvinces, d['Provincia']];
            }
        
            return newSelection;
          });
        });


      const labels = svg.selectAll("text.label")
        .data(data)
        .enter().append("text")
        .attr("x", d => x(d['Axis 1']) + 8)
        .attr("y", d => y(d['Axis 2']) + 2)
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
            .attr('cx', d => newX(d['Axis 1']))
            .attr('cy', d => newY(d['Axis 2']));

          // Riazzera lo stile in base alle province selezionate dopo lo zoom
          circles
            .attr("r", d => selectedProvinces.includes(d['Provincia']) ? 7 : 5)
            .style("stroke", d => selectedProvinces.includes(d['Provincia']) ? "red" : "none")
            .style("stroke-width", d => selectedProvinces.includes(d['Provincia']) ? "0.8px" : "0px")
            .style("opacity", d => selectedProvinces.includes(d['Provincia']) ? 1 : 0.8);
        });
    

  svgElement.call(zoom);

  

};

}, [year, selectedProvinces]);

// Evidenzia i punti delle province appartenenti alla regione selezionata


const labelStyle = {
  padding: '0px',
  borderRadius: '0px',
  display: 'block',  // Questo assicura che ogni label sia su una riga separata
  marginBottom: '-5px', // Spazio tra i label
  cursor: 'pointer',
};






useEffect(() => {
  const svg = d3.select(svgRef.current);

  console.log("Hovered region:", hoverProvincia);  // Verifica che hoveredRegion sia corretto
  svg.selectAll("circle")
    .transition()
    .duration(200)
    .attr("r", d => {
      // Se la provincia è selezionata, deve sempre rimanere evidenziata
      if (selectedProvinces.includes(d['Provincia'])) {
        return 7; // Dimensione maggiore per i cerchi selezionati
      }
      // In caso di hover, evidenzia i cerchi corrispondenti
      if (d.Provincia === hoverProvincia || provinceToRegionMap[d.Provincia] === hoveredRegion) {
        return 7; // Dimensione cerchio più grande se corrisponde
      }
      return 5; // Dimensione standard altrimenti
    })
    .style("opacity", d => {
      // Se la provincia è selezionata, deve mantenere un'opacità alta
      if (selectedProvinces.includes(d['Provincia'])) {
        return 1; // Opacità completa per le selezioni
      }
      // Maggiore opacità per i punti corrispondenti alla regione o alla provincia al hover
      if (d.Provincia === hoverProvincia || provinceToRegionMap[d.Provincia] === hoveredRegion) {
        return 1;
      }
      return 0.5; // Bassa opacità per i non evidenziati
    })
    .style("stroke", d => {
      // Se la provincia è selezionata, deve avere un bordo rosso
      if (selectedProvinces.includes(d['Provincia'])) {
        return "red"; // Bordo rosso per i selezionati
      }
      // Bordo per i punti corrispondenti alla regione o provincia al hover
      if (d.Provincia === hoverProvincia || provinceToRegionMap[d.Provincia] === hoveredRegion) {
        return "red"; // Colore del bordo per quelli hoverati
      }
      return "none"; // Nessun bordo altrimenti
    })
    .style("stroke-width", d => {
      // Se la provincia è selezionata, deve avere un bordo visibile
      if (selectedProvinces.includes(d['Provincia'])) {
        return "0.8px"; // Spessore del bordo per i selezionati
      }
      // Spessore del bordo per i punti corrispondenti
      if (d.Provincia === hoverProvincia || provinceToRegionMap[d.Provincia] === hoveredRegion) {
        return "0.8px"; // Bordo sottile per quelli hoverati
      }
      return "0px"; // Nessun bordo per gli altri
    });
}, [hoveredRegion, hoverProvincia, selectedProvinces]);

useEffect(() => {
  updateColors();
}, [showHigh, showMid, showLow, pollutant]);

useEffect(() => {
  const svg = d3.select(svgRef.current);

  svg.selectAll("circle")
    .transition() // Aggiungi una transizione per un effetto più fluido
    .duration(200) // Imposta la durata della transizione
    .attr("r", d => selectedProvinces.includes(d['Provincia']) ? 7 : 5) // Modifica la dimensione
    .style("stroke", d => selectedProvinces.includes(d['Provincia']) ? "red" : "none") // Modifica il colore del bordo
    .style("stroke-width", d => selectedProvinces.includes(d['Provincia']) ? "0.8px" : "0px") // Modifica lo spessore del bordo
    .style("opacity", d => selectedProvinces.includes(d['Provincia']) ? 1 : 0.8); // Modifica l'opacità per i non selezionati
}, [selectedProvinces]); // Monitora i cambiamenti di selectedProvinces


// Poi gestire i clic in D3, ma lasciare a React l'aggiornamento dello stato
// useEffect(() => {
//   const svg = d3.select(svgRef.current);

//   svg.selectAll("circle")
//     .on("click", function (event, d) {
//       // Qui gestiamo la selezione delle province usando React
//       onProvincesSelect((prevSelectedProvinces) => {
//         const isSelected = prevSelectedProvinces.includes(d['Provincia']);
//         if (isSelected) {
//           return prevSelectedProvinces.filter(p => p !== d['Provincia']); // Rimuove la provincia selezionata
//         } else {
//           return [...prevSelectedProvinces, d['Provincia']]; // Aggiunge la provincia selezionata
//         }
//       });
//     });
// }, [data, onProvincesSelect]);


return (
  <div style={{ display: 'flex' }}>
    <svg ref={svgRef} style={{ height: '350px', width: '400px', overflow: 'visible' }}></svg>
   

    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <label style={labelStyle}>
        <Checkbox sx={{
          '&:hover': { bgcolor: 'transparent' },
          transform: 'scale(0.8)',
          padding: '0px'

        }} checked={showHigh}
          onChange={() => setShowHigh(!showHigh)} defaultChecked color="secondary" />

        {/* <input
            type="checkbox"
            checked={showHigh}
            onChange={() => setShowHigh(!showHigh)}
          /> */}
        High level of {pollutant.replace('_', '')}
      </label>

      <label style={labelStyle}>
        <Checkbox sx={{
          '&:hover': { bgcolor: 'transparent' },
          transform: 'scale(0.8)',
          padding: '0px',

          margin: '0px'

        }} checked={showMid}
          onChange={() => setShowMid(!showMid)} defaultChecked />
        {/* <input
            type="checkbox"
            checked={showMid}
            onChange={() => setShowMid(!showMid)}
          /> */}
        Mid level of {pollutant.replace('_', '')}
      </label>

      <label style={labelStyle}>
        <Checkbox sx={{
          '&:hover': { bgcolor: 'transparent' },
          transform: 'scale(0.8)',
          padding: '0px',
          margin: '0px',
          

        }} checked={showLow}
          onChange={() => setShowLow(!showLow)} defaultChecked color="success" />
        {/* <input
            type="checkbox"
            checked={showLow}
            onChange={() => setShowLow(!showLow)}
          /> */}
        Low level of {pollutant.replace('_', '')}
      </label>
      {selectedProvinces.length > 0 && (
        <div
          ref={tooltipRef}
          style={{
            padding: '10px',
            marginLeft: '10px',
            fontSize: '12px',
            borderRadius: '5px',
            maxHeight: '200px',
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            width: '150px',

            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          }}
        >
          Selected provinces: {selectedProvinces.join(", ")}
        </div>
      )}
    </div>


  </div>

);
};

export default ScatterPlot;
