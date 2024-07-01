import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


const Map = () => {
  const mapRef = useRef();

  useEffect(() => {

    const map = L.map(mapRef.current).setView([41.87194, 12.4], 5);

    // Tile type: openstreetmap normal
    const openstreetmap = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
      maxZoom: 20
    }
    );

    // Tile type: openstreetmap Hot
    const openstreetmapHot = L.tileLayer(
      'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
      maxZoom: 20
    }
    );

    // Tile type: openstreetmap Osm
    const openstreetmapOsm = L.tileLayer(
      'http://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
      maxZoom: 20
    }
    );

    // Base layers definition and addition
    const allOptions = {
      "Open streetmap": openstreetmap,
      "Open streetmap: Hot": openstreetmapHot,
      "Open streetmap: Osm": openstreetmapOsm
    };

    // Initialize with openstreetmap
    openstreetmap.addTo(map);

    // Add a SVG layer to the map
    L.svg().addTo(map);


    // Function to update circle positions
    const update = () => {
      d3.select(mapRef.current)
        .select('svg')
        .selectAll('circle')
        .attr('cx', d => map.latLngToLayerPoint([d.lat, d.long]).x)
        .attr('cy', d => map.latLngToLayerPoint([d.lat, d.long]).y);
    };

    // Load CSV data and add circles
    d3.csv('./years_no2/dati_2010.csv').then(data => {
      const markers = data.map(row => ({
        lat: +row.Lat,
        long: +row.Lon,
        size: +row.media_yy,
        group: "A"
      }));


      // Create a color scale
      var color = d3.scaleOrdinal()
        .domain(["A", "B", "C"])
        .range(["#402D54", "#D18975", "#8FD175"])

      // Add a scale for bubble size
      var size = d3.scaleLinear()
        .domain([1, 200])  // What's in the data
        .range([0.3, 2])  // Size in pixel


      // Select the SVG area and add circles
      d3
        .select('svg')
        .selectAll('circle')
        .data(markers)
        .enter()
        .append("circle")
        .attr("class", d => d.group)
        .attr('cx', d => map.latLngToLayerPoint([d.lat, d.long]).x)
        .attr('cy', d => map.latLngToLayerPoint([d.lat, d.long]).y)
        .attr("r", d => size(d.size))
        .style("fill", d => color(d.group))
        .attr("stroke", d => color(d.group))
        .attr("stroke-width", 3)
        .attr("fill-opacity", .4)

      // Update circle positions on map move end
      map.on('moveend', update);

      // Initial update of circle positions
      update();
    }).catch(error => {
      console.error('Error loading CSV file:', error);
    });

    d3.csv('./years_pm10/dati_2010.csv').then(data => {
      const markers2 = data.map(row => ({
        lat: +row.Lat,
        long: +row.Lon,
        size: +row.media_yy,
        group: "B"
      }));


      // Create a color scale
      var color = d3.scaleOrdinal()
        .domain(["A", "B", "C"])
        .range(["#402D54", "#D18975", "#8FD175"])

      // Add a scale for bubble size
      var size = d3.scaleLinear()
        .domain([1, 200])  // What's in the data
        .range([0.3, 2])  // Size in pixel


      // Select the SVG area and add circles
      d3
        .select('svg')
        .selectAll('circle')
        .data(markers2)
        .enter()
        .append("circle")
        .attr("class", d => d.group)
        .attr('cx', d => map.latLngToLayerPoint([d.lat, d.long]).x)
        .attr('cy', d => map.latLngToLayerPoint([d.lat, d.long]).y)
        .attr("r", d => size(d.size))
        .style("fill", d => color(d.group))
        .attr("stroke", d => color(d.group))
        .attr("stroke-width", 3)
        .attr("fill-opacity", .4)

      // Update circle positions on map move end
      map.on('moveend', update);

      // Initial update of circle positions
      update();
    }).catch(error => {
      console.error('Error loading CSV file:', error);
    });

    // Cleanup function to remove the map instance on component unmount
    return () => {
      map.remove();
    };
  }, []);

  return <div id="mapid" ref={mapRef} style={{ height: '350px', width: '400px' }}></div>;
};


export default Map;