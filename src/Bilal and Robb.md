---
theme: dashboard
title: Robb - Bilal
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
// Utility Functions
async function fetchGeoJSON(url) {
  const response = await fetch(url);
  return response.json();
}

function mapPopulationToEntities(data) {
  return new Map(data.map(d => [d.Entity, d.Population2022]));
}

function calculateEmissions(emissionsData, populationMap, year, countryNameMapping) {
  return emissionsData
    .filter(d => d.Year === year)
    .map(d => {
      let countryName = countryNameMapping[d.Entity] || d.Entity;
      const population = populationMap.get(countryName);
      const totalEmissions = population ? d["Annual CO₂ emissions (per capita)"] * population : null;
      return {
        ...d,
        Population: population,
        TotalEmissions: totalEmissions,
      };
    });
}

function updateGeoJSONWithEmissions(worldData, emissionsMap, countryNameMapping) {
  return worldData.features.map(feature => {
    let countryName = countryNameMapping[feature.properties.name] || feature.properties.name;
    feature.properties.emission = emissionsMap.get(countryName);
    return feature;
  });
}

function createColorScale(emissionsData, interpolateScheme) {
  const maxEmission = d3.max(emissionsData, d => d.TotalEmissions);
  return d3.scaleSequential(interpolateScheme).domain([0, maxEmission]);
}

function createProjection(width, height) {
  return d3.geoMercator().scale(140).translate([width / 2, height / 1.5]);
}

function addLegend(svg, colorScale, width, height, customFormat) {
  const legendWidth = 300;
  const legendHeight = 20;

  const legendGroup = svg.append("g")
    .attr("transform", `translate(${(width - legendWidth) / 2}, ${height - 50})`);

  const legendScale = d3.scaleLinear()
    .domain(colorScale.domain())
    .range([0, legendWidth]);

  const defs = svg.append("defs");
  const linearGradient = defs.append("linearGradient").attr("id", "legend-gradient");

  linearGradient.selectAll("stop")
    .data(colorScale.ticks(10).map((t, i, n) => ({
      offset: `${(100 * i) / (n.length - 1)}%`,
      color: colorScale(t),
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
    .call(d3.axisBottom(legendScale).ticks(3).tickFormat(customFormat))
    .select(".domain").remove();
}

function drawMap(container, countriesWithEmissions, projection, colorScale, customFormat) {
  const path = d3.geoPath().projection(projection);
  const svg = container.append("svg")
    .attr("width", container.node().clientWidth)
    .attr("height", container.node().clientHeight);

  const mapGroup = svg.append("g");

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

  return { svg, mapGroup };
}

function addZoom(svg, mapGroup, width, height) {
  const zoomHandler = d3.zoom()
    .scaleExtent([1, 8])
    .translateExtent([[-width, -height], [2 * width, 2 * height]])
    .on("zoom", event => mapGroup.attr("transform", event.transform));

  svg.call(zoomHandler);
}

// Main Function
async function createCO2EmissionsMapWorld(containerId, options = {}) {
  const {
    populationData,
    emissionsData,
    countryNameMapping,
    geoJSONUrl,
    year = 2022,
    colorScheme = d3.interpolateYlOrRd,
    customFormat = value => (value / 1_000_000_000).toFixed(4) + " BillionTons",
  } = options;

  const container = d3.select(`#${containerId}`);
  const width = container.node().clientWidth;
  const height = container.node().clientHeight;

  const populationMap = mapPopulationToEntities(populationData);
  const emissionsWithPopulation = calculateEmissions(emissionsData, populationMap, year, countryNameMapping);
  const emissionsMap = new Map(emissionsWithPopulation.map(d => [d.Entity, d.TotalEmissions]));

  const worldData = await fetchGeoJSON(geoJSONUrl);
  const countriesWithEmissions = updateGeoJSONWithEmissions(worldData, emissionsMap, countryNameMapping);

  const colorScale = createColorScale(emissionsWithPopulation, colorScheme);
  const projection = createProjection(width, height);

  const { svg, mapGroup } = drawMap(container, countriesWithEmissions, projection, colorScale, customFormat);

  addZoom(svg, mapGroup, width, height);
  addLegend(svg, colorScale, width, height, customFormat);
}

createCO2EmissionsMapWorld("MapOnechart", {
  populationData: region_population,
  emissionsData: co_emissions_per_capita,
  countryNameMapping: countryNameMapping,
  geoJSONUrl: "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson",
});



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

  // Scala colori basata sulle emissioni totali
  const maxEmission = d3.max(topEmissions, d => d.TotalEmissions);
  const colorScale = scaleSequential(interpolateYlOrRd).domain([0, maxEmission]);

  // SVG e gruppo mappa
  const svg = container.append("svg")
    .attr("width", width)
    .attr("height", height);

  const mapGroup = svg.append("g");

  // Funzione di formattazione personalizzata
  function customFormat(value) {
    if (value >= 1e4) return (value / 1_000_000_000).toFixed(4) + " Billion tons";
    return value + " BillionTons";
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

  // Trascinamento per ruotare il globo
  let rotate = [0, 0];
  let isDragging = false;
  let lastPosition = null;

  svg.on("mousedown", (event) => {
    isDragging = true;
    lastPosition = [event.clientX, event.clientY];
  });

  svg.on("mousemove", (event) => {
    if (isDragging) {
      const [dx, dy] = [event.clientX - lastPosition[0], event.clientY - lastPosition[1]];
      rotate[0] += dx / 5;
      rotate[1] -= dy / 5;
      projection.rotate(rotate);
      mapGroup.selectAll("path").attr("d", path);
      lastPosition = [event.clientX, event.clientY];
    }
  });

  svg.on("mouseup", () => {
    isDragging = false;
  });

  svg.on("mouseleave", () => {
    isDragging = false;
  });

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