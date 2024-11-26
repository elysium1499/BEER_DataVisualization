---
theme: dashboard
title: Section 3
toc: true
---


# CO₂ Emissions Map 🌍

<br>

## Plot 1

<br>

```js
import { geoMercator, geoOrthographic, geoPath } from "d3-geo";
import { scaleSequential } from "d3-scale";
import { interpolateYlOrRd } from "d3-scale-chromatic";
import { zoom } from "d3-zoom";

const countryNameMapping = {
    "USA": "United States",
    "England": "United Kingdom",
    "Czech Republic": "Czechia",
    "Republic of Serbia": "Serbia",
    "Guinea Bissau": "Guinea-Bissau",
    "Macedonia": "North Macedonia",
    "Ivory Coast": "Cote d'Ivoire",
    "Somaliland": "Somalia",
    "Republic of the Congo": "Congo",
    "Democratic Republic of the Congo": "Congo",
    "United Republic of Tanzania": "Tanzania",
    "The Bahamas": "Bahamas"
  };

  const co_emissions_per_capita = await FileAttachment("data/co-emissions-per-capita-filter.csv").csv({ typed: true });
  const region_population = await FileAttachment("data/region_entities_population2022.csv").csv({ typed: true });
```



```js
async function createCO2EmissionsMapWorld(containerId) {
  const populationMap = new Map(region_population.map(d => [d.Entity, d.Population2022]));

  const emissionsWithPopulation = co_emissions_per_capita.filter(d => d.Year === 2022).map(d => {
    let countryName = d.Entity;
    countryName = countryNameMapping[countryName] || countryName;

    const population = populationMap.get(countryName);
    const totalEmissions = population ? d["Annual CO₂ emissions (per capita)"] * population : null;
    return {
      ...d,
      Population: population,
      TotalEmissions: totalEmissions,
    };
  });

  // Ordina i paesi per emissioni totali
  const topEmissions = emissionsWithPopulation.sort((a, b) => (b.TotalEmissions || 0) - (a.TotalEmissions || 0));

  // URL del file GeoJSON
  const url = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";
  const worldData = await fetch(url).then(response => response.json());

  // Crea una mappa delle emissioni totali
  const emissionMap = new Map(topEmissions.map(d => [d.Entity, d.TotalEmissions]));

  // Aggiorna il GeoJSON con i dati
  const countriesWithEmissions = worldData.features.map(feature => {
    let countryName = feature.properties.name;
    countryName = countryNameMapping[countryName] || countryName;

    const emission = emissionMap.get(countryName);
    feature.properties.emission = emission;
    return feature;
  });

  // Dimensioni del contenitore
  const container = d3.select("#" + containerId);
  const width = container.node().clientWidth;
  const height = container.node().clientHeight;

  // Proiezione e path
  const projection = d3.geoMercator()
    .scale(140)
    .translate([width / 2, height / 1.5]);

  const path = geoPath().projection(projection);

  // Calcola il minimo e massimo valore delle emissioni
  const minEmission = d3.min(topEmissions, d => d.TotalEmissions || 0);
  const maxEmission = d3.max(topEmissions, d => d.TotalEmissions);

  // Define custom percentiles (e.g., 10th, 30th, 50th, 70th, 90th)
  const customPercentiles = [0.05, 0.1, 0.15, 0.2, 0.3, 0.5, 0.7, 0.8, 0.85, 0.9, 0.96, 0.98, 0.99];

  // Calculate the actual values for those percentiles
  const quantileValues = customPercentiles.map(p => d3.quantile(topEmissions.map(d => d.TotalEmissions).filter(d => d != null), p));

  // Add the min and max values to the quantile breaks
  quantileValues.unshift(minEmission);
  quantileValues.push(maxEmission);

  // Sort the quantile breaks (it ensures they are in order)
  quantileValues.sort((a, b) => a - b);

  // Use d3.scaleQuantile for quantile-based color scaling
  const colorScale = d3.scaleQuantile()
    .domain(quantileValues) // Apply the custom quantile breaks as the domain
    .range([
      "#ffffe0", "#fffb80", "#fff566", "#ffed3e", "#ffdb2d", "#ffcc00", 
      "#ffaa00", "#ff8c00", "#ff7300", "#ff5722", "#e64a19", "#d32f2f", 
      "#c62828", "#b71c1c"
    ]);

  // SVG e gruppo mappa
  const svg = container.append("svg")
    .attr("width", width)
    .attr("height", height);

  const mapGroup = svg.append("g");

  // Funzione di formattazione personalizzata
  function customFormat(value) {
    return (value / 1e9).toFixed(2) + " Billion Tons";
  }

  // Disegna la mappa
  mapGroup.selectAll("path")
    .data(countriesWithEmissions)
    .join("path")
    .attr("d", path)
    .attr("fill", d => {
      const emissions = d.properties.emission;
      return emissions ? colorScale(emissions) : "#ccc";
    })
    .attr("stroke", "white")
    .attr("stroke-width", 0.5)
    .append("title")
    .text(d => {
      const emissions = d.properties.emission;
      return `${d.properties.name}: ${emissions ? customFormat(emissions) : "No data"}`;
    });

  // Zoom e pan
  const zoomHandler = zoom()
    .scaleExtent([1, 8])
    .translateExtent([[-width, -height], [2 * width, 2 * height]])
    .on("zoom", (event) => {
      mapGroup.attr("transform", event.transform);
    });

  svg.call(zoomHandler);

  // Aggiungi la legenda
  const legendWidth = 300;
  const legendHeight = 20;

  const legendGroup = svg.append("g")
    .attr("transform", `translate(${(width - legendWidth) / 2}, ${height - 50})`);

  const legendScale = d3.scaleLinear()
    .domain([minEmission, maxEmission])
    .range([0, legendWidth]);

  const defs = svg.append("defs");
  const linearGradient = defs.append("linearGradient")
    .attr("id", "legend-gradient");

  linearGradient.selectAll("stop")
    .data(quantileValues.map((t, i, n) => ({
      offset: `${(100 * i) / (n.length - 1)}%`,
      color: colorScale(t)
    })))
    .join("stop")
    .attr("offset", d => d.offset)
    .attr("stop-color", d => d.color);

  legendGroup.append("rect")
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#legend-gradient)");

  legendGroup.append("g")
    .attr("transform", `translate(0, ${legendHeight})`)
    .call(d3.axisBottom(legendScale)
      .ticks(3)
      .tickFormat(d => customFormat(d)))
    .select(".domain").remove();
}

// Crea la mappa
createCO2EmissionsMapWorld("MapOnechart");


```
<div id="MapOnechart" style="width: 100%; height: 600px; margin-bottom: 50px;"></div>

<p>
parole parole parole
</p>

## Plot 2
```js

async function createCO2EmissionsMapEarth(containerId) {
  // Trasforma il dataset della popolazione in una mappa
  const populationMap = new Map(region_population.map(d => [d.Entity, d.Population2022]));

  // Calcola le emissioni totali per ogni paese
  const emissionsWithPopulation = co_emissions_per_capita
    .filter(d => d.Year === 2022)
    .map(d => {
      let countryName = d.Entity;
      countryName = countryNameMapping[countryName] || countryName;

      const population = populationMap.get(countryName);
      const totalEmissions = population ? d["Annual CO₂ emissions (per capita)"] * population : null;
      return {
        ...d,
        Population: population,
        TotalEmissions: totalEmissions,
      };
    });

  // Ordina i paesi per emissioni totali
  const topEmissions = emissionsWithPopulation.sort((a, b) => (b.TotalEmissions || 0) - (a.TotalEmissions || 0));

  // URL del file GeoJSON
  const url = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";
  const worldData = await fetch(url).then(response => response.json());

  // Crea una mappa delle emissioni totali
  const emissionMap = new Map(topEmissions.map(d => [d.Entity, d.TotalEmissions]));

  // Aggiorna il GeoJSON con i dati
  const countriesWithEmissions = worldData.features.map(feature => {
    let countryName = feature.properties.name;
    countryName = countryNameMapping[countryName] || countryName;

    const emission = emissionMap.get(countryName);
    feature.properties.totalEmission = emission;
    return feature;
  });

  // Dimensioni del contenitore
  const container = d3.select("#" + containerId);
  const width = container.node().clientWidth;
  const height = container.node().clientHeight;

  // Proiezione e path
  const projection = geoOrthographic()
    .scale(200)
    .translate([width / 2, height / 2]);

  const path = geoPath().projection(projection);

  // Define custom percentiles for color breaks
  const customPercentiles = [0.05, 0.1, 0.15, 0.2, 0.3, 0.5, 0.7, 0.8, 0.85, 0.9, 0.96, 0.98, 0.99];

  // Calculate the quantile values based on custom percentiles
  const quantileValues = customPercentiles.map(p => d3.quantile(topEmissions.map(d => d.TotalEmissions).filter(d => d != null), p));

  // Add min and max values to the quantile breaks
  const minEmission = d3.min(topEmissions, d => d.TotalEmissions);
  const maxEmission = d3.max(topEmissions, d => d.TotalEmissions);
  quantileValues.unshift(minEmission);
  quantileValues.push(maxEmission);

  // Sort the quantile values (this ensures they are in order)
  quantileValues.sort((a, b) => a - b);

  // Use d3.scaleQuantile for quantile-based color scaling
  const colorScale = d3.scaleQuantile()
    .domain(quantileValues) // Apply the custom quantile breaks as the domain
    .range([
      "#ffffe0", "#fffb80", "#fff566", "#ffed3e", "#ffdb2d", "#ffcc00", 
      "#ffaa00", "#ff8c00", "#ff7300", "#ff5722", "#e64a19", "#d32f2f", 
      "#c62828", "#b71c1c"
    ]);

  // SVG e gruppo mappa
  const svg = container.append("svg")
    .attr("width", width)
    .attr("height", height);

  const mapGroup = svg.append("g");

  // Funzione di formattazione personalizzata
  function customFormat(value) {
    return (value / 1e9).toFixed(2) + " Billion Tons";
  }

  // Disegna la mappa
  mapGroup.selectAll("path")
    .data(countriesWithEmissions)
    .join("path")
    .attr("d", path)
    .attr("fill", d => {
      const emissions = d.properties.totalEmission;
      return emissions ? colorScale(emissions) : "#ccc";
    })
    .attr("stroke", "white")
    .attr("stroke-width", 0.5)
    .append("title")
    .text(d => {
      const emissions = d.properties.totalEmission;
      return `${d.properties.name}: ${emissions ? customFormat(emissions) : "No data"}`;
    });

  // Gestione del trascinamento per rotazione
  let lastX = 0;
  let lastY = 0;

  svg.call(d3.drag()
    .on("start", (event) => {
      lastX = event.x;
      lastY = event.y;
    })
    .on("drag", (event) => {
      const dx = event.x - lastX;
      const dy = event.y - lastY;
      const rotation = projection.rotate();
      projection.rotate([rotation[0] + dx / 2, rotation[1] - dy / 2]); // Modifica i parametri per regolare la sensibilità della rotazione
      mapGroup.selectAll("path").attr("d", path);
      lastX = event.x;
      lastY = event.y;
    })
  );

  // Zoom per ingrandire/rimpicciolire
  const zoomHandler = zoom()
    .scaleExtent([0.5, 8]) // Zoom minimo e massimo
    .on("zoom", (event) => {
      mapGroup.attr("transform", event.transform);
    });

  svg.call(zoomHandler);

  // Aggiungi la legenda
  const legendWidth = 300;
  const legendHeight = 20;

  const legendGroup = svg.append("g")
    .attr("transform", `translate(${(width - legendWidth) / 2}, ${height - 50})`);

  const legendScale = d3.scaleLinear()
    .domain([0, maxEmission])
    .range([0, legendWidth]);

  const defs = svg.append("defs");
  const linearGradient = defs.append("linearGradient")
    .attr("id", "legend-gradient");

  linearGradient.selectAll("stop")
    .data(colorScale.ticks(20).map((t, i, n) => ({
      offset: `${(100 * i) / (n.length - 1)}%`,
      color: colorScale(t)
    })))
    .join("stop")
    .attr("offset", d => d.offset)
    .attr("stop-color", d => d.color);

  legendGroup.append("rect")
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#legend-gradient)");

  legendGroup.append("g")
    .attr("transform", `translate(0, ${legendHeight})`)
    .call(d3.axisBottom(legendScale)
      .ticks(3)
      .tickFormat(d => customFormat(d)))
    .select(".domain").remove();
}

// Crea la mappa
createCO2EmissionsMapEarth("MapTwochart");


```
<div id="MapTwochart" style="width: 100%; height: 500px; margin-bottom: 50px;"></div>

<p>
parole parole parole
</p>