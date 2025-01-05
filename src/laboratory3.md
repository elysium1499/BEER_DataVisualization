---
theme: dashboard
title: Don't get confused by maps
toc: true
---
<style>
/* Tema Scuro fisso */
:root {
  --theme-background: #121212;             /* Sfondo scuro */
  --theme-foreground: #ffffff;             /* Testo chiaro */
  --theme-foreground-muted: #b0bec5;       /* Testo secondario */
  --theme-border: #444444;                 /* Bordi */
  --theme-card-background: #1e1e1e;        /* Sfondo card */
  /*--theme-foreground-focus: #ffffff;       /* Evidenziazione nei gradienti */
}

/* Tema fisso indipendentemente dal sistema */
@media (prefers-color-scheme: light) {
  :root {
    --theme-background: #121212;
    --theme-foreground: #ffffff;
    --theme-foreground-muted: #b0bec5;
    --theme-border: #444444;
    --theme-card-background: #1e1e1e;
    /*--theme-foreground-focus: #ffffff;*/
  }
}

/* Corpo della pagina */
body {
  background-color: var(--theme-background);
  color: var(--theme-foreground);
}

/* Grafici SVG */
svg {
  background-color: var(--theme-background); /* Sfondo grafici */
}

text, svg text {
  fill: var(--theme-foreground); /* Colore testo nei grafici */
}

/* Assi nei grafici */
.axis line, .axis path {
  stroke: var(--theme-foreground-muted); /* Linee assi */
}

.axis text {
  fill: var(--theme-foreground-muted); /* Testo assi */
}

/* Contenitore delle card */
.cards-container {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Card */
.card {
  padding: 1rem;
  border: 1px solid var(--theme-border);
  border-radius: 8px;
  background-color: var(--theme-card-background); /* Sfondo card */
  color: var(--theme-foreground);
}

/* Sezione hero */
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: var(--sans-serif);
  margin: 4rem 0 8rem;
  text-wrap: balance;
  text-align: center;
}

/* Titolo hero */
.hero h1 {
  margin: 1rem 0;
  padding: 1rem 0;
  max-width: none;
  font-size: 14vw;
  font-weight: 900;
  line-height: 1;
  background: linear-gradient(30deg, var(--theme-foreground-focus), currentColor);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Sottotitolo hero */
.hero h2 {
  margin: 0;
  max-width: 34em;
  font-size: 20px;
  font-style: initial;
  font-weight: 500;
  line-height: 1.5;
  color: var(--theme-foreground-muted);
}

/* Responsività */
@media (min-width: 640px) {
  .hero h1 {
    font-size: 90px;
  }
}

/* Sidebar */
.sidebar {
  background-color: var(--theme-background);  /* Sfondo scuro */
  color: var(--theme-foreground);            /* Testo chiaro */
  border-right: 1px solid var(--theme-border); /* Bordo scuro */
}

/* Link nella sidebar */
.sidebar a {
  color: var(--theme-foreground);             /* Link chiari */
  text-decoration: none;                      /* Nessuna sottolineatura */
}

.sidebar a:hover {
  color: var(--theme-foreground-muted);       /* Hover più tenue */
}

/* Toggle sidebar */
.sidebar-toggle {
  background-color: var(--theme-background);  /* Sfondo scuro */
  color: var(--theme-foreground);             /* Testo chiaro */
  border: 1px solid var(--theme-border);      /* Bordo coerente */
}

/* Icona del toggle */
.sidebar-toggle::before {
  content: "☰";                              /* Icona del menu (hamburger) */
  color: var(--theme-foreground);             /* Icona chiara */
}

/* Highlight nella sidebar (elementi selezionati) */
.sidebar .active {
  background-color: var(--theme-card-background); /* Sfondo per elemento selezionato */
  color: var(--theme-foreground);                 /* Testo selezionato chiaro */
}

</style>
# Don't get confused by maps 🗺️

<br>

<p>

The following maps display the total CO₂ emissions of countries. While maps are a powerful tool for visualizing data, their interpretation requires caution. The choice of projection can mislead the user by overemphasizing or minimizing continents. This is especially true in cases like CO₂ emissions, where absolute emissions and per capita values paint different pictures of responsibility and impact.

The legends illustrate the levels of CO₂ emissions through a gradual progression of colors. At the lower end of the scale, white represents continents with the least emissions. As emissions increase, the color transitions to yellow, symbolizing moderate levels of emissions. Finally, red marks the highest emission levels. 
</p>

## Mercator projection

<br>

```js
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

function createTooltip(id) {
  return d3.select("body").append("div")
    .attr("id", id)
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "rgba(0, 0, 0, 0.7)")
    .style("color", "white")
    .style("padding", "5px 10px")
    .style("border-radius", "4px")
    .style("font-size", "12px")
    .style("pointer-events", "none")
    .style("display", "none")
    .style("z-index", "10"); 
}

import { geoMercator, geoEqualEarth, geoAzimuthalEqualArea, geoPath } from "d3-geo";
import { scaleSequential, scaleQuantile } from "d3-scale";
import { interpolateYlOrRd } from "d3-scale-chromatic";
import { zoom } from "d3-zoom";


async function getEmissionsWithPopulation(co_emissions_per_capita, region_population, countryNameMapping) {

  const populationMap = new Map(region_population.map(d => [d.Entity, d.Population2022]));

  const emissionsWithPopulation = co_emissions_per_capita.filter(d => d.Year === 2022).map(d => {
    let countryName = d.Entity;
    countryName = countryNameMapping[countryName] || countryName;

    const population = populationMap.get(countryName);
    const totalEmissions = population ? d["Annual CO₂ emissions (per capita)"] * population : null;

    return {...d, Population: population, TotalEmissions: totalEmissions};
  });
  return emissionsWithPopulation;
}

async function getEmissionsData(co_emissions_per_capita) {
  const emissionsData = co_emissions_per_capita.filter(d => d.Year === 2022).map(d => ({
    Entity: d.Entity,
    Emissions: d["Annual CO₂ emissions (per capita)"],
  }));

  return emissionsData;
}


function updateLegend(legendRectWidth, legendRectHeight, legendGroup, legendSpacing, minEmission, quantileValues, maxEmission, colorScale, customFormat) {
  const quantileBreaks = [minEmission, ...quantileValues, maxEmission];

  legendGroup.selectAll("*").remove();

  // Calculate the number of columns based on width
  const numColumns = Math.floor(width / (legendRectWidth + legendSpacing));
  const numRows = Math.ceil(quantileBreaks.length / numColumns);

  // Adjust legend position to make room for multiple rows
  legendGroup.attr("transform", `translate(50, ${30})`);

  // Create legend rectangles
  legendGroup.selectAll("rect")
    .data(quantileBreaks.slice(0, -1))
    .join("rect")
    .attr("x", (d, i) => (i % numColumns) * (legendRectWidth + legendSpacing))
    .attr("y", (d, i) => Math.floor(i / numColumns) * (legendRectHeight + 15))
    .attr("width", legendRectWidth+10)
    .attr("height", legendRectHeight)
    .style("fill", (d, i) => colorScale(d));

  // Create legend text labels
  legendGroup.selectAll("text")
    .data(quantileBreaks.slice(0, -1))
    .join("text")
    .attr("x", (d, i) => (i % numColumns) * (legendRectWidth + legendSpacing) + legendRectWidth / 2 +5)
    .attr("y", (d, i) => Math.floor(i / numColumns) * (legendRectHeight + 15) + legendRectHeight + 12)
    .attr("text-anchor", "middle")
    .style("fill", "white")
    .style("font-size", "9px")
    .text((d, i) => {
      const lower = quantileBreaks[i];
      const upper = quantileBreaks[i + 1];
      return `${customFormat(lower)} - ${customFormat(upper)}`;
    });
}

function insertZoomHandler(mapGroup, height){
  return d3.zoom().scaleExtent([1, 8]).translateExtent([[-width, -height], [2 * width, 2 * height]]).on("zoom", (event) => {
    mapGroup.attr("transform", event.transform);
  });
}

```





```js
async function createCO2EmissionsMapWorld(containerId, customPercentiles = [0.25, 0.5, 0.75, 0.95]) {
  const co_emissions_per_capita = await FileAttachment("data/co-emissions-per-capita-filter.csv").csv({ typed: true });
  const region_population = await FileAttachment("data/region_entities_population2022.csv").csv({ typed: true });

 const emissionsWithPopulation = await getEmissionsWithPopulation(co_emissions_per_capita, region_population, countryNameMapping);

  const topEmissions = emissionsWithPopulation.sort((a, b) => (b.TotalEmissions || 0) - (a.TotalEmissions || 0));

  const url = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";
  const worldData = await fetch(url).then(response => response.json());

  const emissionMap = new Map(topEmissions.map(d => [d.Entity, d.TotalEmissions]));

  const countriesWithEmissions = worldData.features.map(feature => {
    let countryName = feature.properties.name;
    countryName = countryNameMapping[countryName] || countryName;

    const emission = emissionMap.get(countryName);
    feature.properties.emission = emission;
    return feature;
  });

  const container = d3.select("#" + containerId);

  // Resize dynamically based on container
  const width = container.node().clientWidth;
  const height = container.node().clientHeight;

  const projection = d3.geoMercator()
    .scale(100)
    .translate([width / 2, height / 1.5]);

  const path = d3.geoPath().projection(projection);

  const minEmission = d3.min(topEmissions, d => d.TotalEmissions || 0);
  const maxEmission = d3.max(topEmissions, d => d.TotalEmissions);

  const quantileValues = customPercentiles.map(p =>
    d3.quantile(topEmissions.map(d => d.TotalEmissions).filter(d => d != null), p)
  );

  quantileValues.unshift(minEmission);
  quantileValues.push(maxEmission);

  quantileValues.sort((a, b) => a - b);

  const colorScale = d3.scaleQuantile()
    .domain(quantileValues)
    .range([
      "#ffffe0", "#fffb80", "#fff566", "#ffed3e", "#ffdb2d", "#ffcc00",
      "#ffaa00", "#ff8c00", "#ff7300", "#ff5722", "#e64a19", "#d32f2f",
      "#c62828", "#b71c1c"
    ]);

  const svg = container.append("svg")
    .attr("width", width)
    .attr("height", height);

  const mapGroup = svg.append("g");

  function customFormat(value) {
    if (value >= 1e9) {
      return (value / 1e9).toFixed(2) + " Bt";
    } else if (value >= 1e6) {
      return (value / 1e6).toFixed(2) + " Mt";
    } else {
      return value.toFixed(2) + " t";
    }
  }

  const tooltip = createTooltip("tooltip3");
  
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
    .on("mouseover", (event, d) => {
      const emissions = d.properties.emission;
      tooltip.style("display", "block")
        .style("opacity", 1)
        .html(`<strong>${d.properties.name}</strong><br>
             Emissions: ${emissions ? customFormat(emissions) : "No data"}`);
    })
    .on("mousemove", (event) => {
      tooltip.style("left", (event.pageX + 10) + "px")
             .style("top", (event.pageY - 10) + "px");
    })
    .on("mouseout", () => {
      tooltip.style("display", "none");
    });

  svg.call(insertZoomHandler(mapGroup, height));

  const legendGroup = svg.append("g")
    .attr("transform", `translate(50, 30)`);

  const legendRectWidth = 70;
  const legendRectHeight = 20;
  const legendSpacing = 20;

  // Initial legend rendering
  updateLegend(legendRectWidth, legendRectHeight, legendGroup, legendSpacing, minEmission, quantileValues, maxEmission, colorScale, customFormat);

  // Handle window resizing
  window.addEventListener("resize", () => {
    const width = container.node().clientWidth;
    const height = container.node().clientHeight;
    svg.attr("width", width).attr("height", height);
    projection.translate([width / 2, height / 2]);
    mapGroup.selectAll("path").attr("d", path);
    updateLegend();
  });
}

createCO2EmissionsMapWorld("MapOnechart");

```
<div id="MapOnechart" style="width: 100%; height: 650px; margin-bottom: 50px;"></div>

<p>

</p>

## Orthografic projection
```js
async function createCO2EmissionsMapEarth(containerId) {
  // Load datasets
  const co_emissions_per_capita = await FileAttachment("data/co-emissions-per-capita-filter.csv").csv({ typed: true });
  const region_population = await FileAttachment("data/region_entities_population2022.csv").csv({ typed: true });

  // Transform the population dataset into a map
  const populationMap = new Map(region_population.map(d => [d.Entity, d.Population2022]));

  // Calculate total emissions for each country
  const emissionsWithPopulation = await getEmissionsWithPopulation(co_emissions_per_capita, region_population, countryNameMapping);

  // Sort countries by total emissions
  const topEmissions = emissionsWithPopulation.sort((a, b) => (b.TotalEmissions || 0) - (a.TotalEmissions || 0));

  // Calculate percentiles and create a discrete color scale
  const customPercentiles = [0.25, 0.5, 0.75, 0.95];
  const quantileValues = customPercentiles.map(p =>
    d3.quantile(topEmissions.map(d => d.TotalEmissions).filter(d => d != null), p)
  );
  const minEmission = d3.min(topEmissions, d => d.TotalEmissions);
  const maxEmission = d3.max(topEmissions, d => d.TotalEmissions);

  quantileValues.unshift(minEmission);
  quantileValues.push(maxEmission);

  const colorScale = d3.scaleQuantile()
    .domain(quantileValues)
    .range([
      "#ffffe0", "#fffb80", "#fff566", "#ffed3e", "#ffdb2d", "#ffcc00",
      "#ffaa00", "#ff8c00", "#ff7300", "#ff5722", "#e64a19", "#d32f2f",
      "#c62828", "#b71c1c"
    ]);

  // URL of GeoJSON file
  const url = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";
  const worldData = await fetch(url).then(response => response.json());

  // Create a map of total emissions
  const emissionMap = new Map(topEmissions.map(d => [d.Entity, d.TotalEmissions]));

  // Update GeoJSON with emission data
  const countriesWithEmissions = worldData.features.map(feature => {
    let countryName = feature.properties.name;
    countryName = countryNameMapping[countryName] || countryName;

    const emission = emissionMap.get(countryName);
    feature.properties.totalEmission = emission;
    return feature;
  });

  // Container dimensions
  const container = d3.select("#" + containerId);
  const width = container.node().clientWidth;
  const height = container.node().clientHeight;

  // Projection and path (Mercator projection)
  const projection = d3.geoOrthographic()
    .scale(150)
    .translate([(width / 2), height / 2]);
  const path = d3.geoPath().projection(projection);

  // Create SVG and map group
  const svg = container.append("svg")
    .attr("width", width)
    .attr("height", height);

  const mapGroup = svg.append("g");

  function customFormat(value) {
    if (value >= 1e9) {
      return (value / 1e9).toFixed(2) + " Bt";
    } else if (value >= 1e6) {
      return (value / 1e6).toFixed(2) + " Mt";
    } else {
      return value.toFixed(2) + " t";
    }
  }

  const tooltip = createTooltip("tooltip2");

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
    .on("mouseover", (event, d) => {
      const emissions = d.properties.totalEmission;
      tooltip.style("display","block")
        .style("opacity", 1)
        .html(`<strong>${d.properties.name}</strong><br>
             Emissions: ${emissions ? customFormat(emissions) : "No data"}`);
    })
    .on("mousemove", (event) => {
      tooltip.style("left", (event.pageX + 10) + "px")
             .style("top", (event.pageY - 10) + "px");
    })
    .on("mouseout", () => {
      tooltip.style("display", "none");
    });

  // Drag interactions
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
      projection.rotate([rotation[0] + dx / 2, rotation[1] - dy / 2]);
      mapGroup.selectAll("path").attr("d", path);
      lastX = event.x;
      lastY = event.y;
    })
  );

  svg.call(insertZoomHandler(mapGroup, height));

  const legendRectWidth = 70;
  const legendRectHeight = 20;
  const legendSpacing = 20;

  const legendGroup = svg.append("g")
    .attr("transform", `translate(50,30)`);  // Move legend to the top

  updateLegend(legendRectWidth, legendRectHeight, legendGroup, legendSpacing, minEmission, quantileValues, maxEmission, colorScale, customFormat);

  // Add event listener to handle window resizing
  window.addEventListener("resize", () => {
    const width = container.node().clientWidth;
    const height = container.node().clientHeight;
    svg.attr("width", width).attr("height", height);
    projection.translate([width / 2, height / 2]);
    mapGroup.selectAll("path").attr("d", path);
    updateLegend();
  });
}

// Create the map
createCO2EmissionsMapEarth("MapTwochart");

```
<div id="MapTwochart" style="width: 100%; height: 500px; margin-bottom: 50px;"></div>

<p>

In the *Mercator* projection, northern countries like the **USA**, **Russia**, and **Canada** are represented with inflated sizes, giving a visual impression that these continents have a disproportionately large impact on emissions. This distortion occurs because the Mercator projection stretches areas farther from the equator to maintain angular accuracy, which is useful for navigation but misleading for visualizing data distribution.

On the other hand, the *Orthographic* projection provides a more visually balanced representation by simulating a globe viewed from a specific perspective. While this projection reduces the distortion of landmass sizes compared to *Mercator*, it introduces its own biases. Central continents in the chosen perspective appear larger and more prominent, potentially drawing attention to their emissions while downplaying those from continents located at the periphery of the map, such as parts of **Africa**, **South America**, or **Oceania**. Understanding these projection biases is crucial when interpreting maps to avoid misjudging the relative contributions of different continents to CO₂ emissions.
</p>

<br>

<p>
These maps shift the focus from absolute values to emissions normalized per person. This is crucial for understanding individual-level contributions and comparing nations with vastly different population sizes. However, here too, map distortions might confuse viewers.
</p>

## Equal Earth projection

```js
async function createCO2EmissionsMapWorld(containerId, customPercentiles = [0.25, 0.5, 0.75, 0.95]) {
  const co_emissions_per_capita = await FileAttachment("data/co-emissions-per-capita-filter.csv").csv({ typed: true });

  const emissionsData = await getEmissionsData(co_emissions_per_capita)

  const url = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";
  const worldData = await fetch(url).then(response => response.json());

  const emissionMap = new Map(emissionsData.map(d => [d.Entity, d.Emissions]));

  const countriesWithEmissions = worldData.features.map(feature => {
    let countryName = feature.properties.name;
    countryName = countryNameMapping[countryName] || countryName;

    const emission = emissionMap.get(countryName);
    feature.properties.emission = emission;
    return feature;
  });

  const container = d3.select("#" + containerId);
  const width = container.node().clientWidth;
  const height = container.node().clientHeight;

  // Using conic equidistant projection
  const projection = geoEqualEarth()
    .scale(130) // Adjust scale for better fit
    .translate([width / 2, height / 2]) // Center projection in SVG
    .center([0, 0]) // Center map at long 0, lat 20

  const path = geoPath().projection(projection);

  const minEmission = d3.min(emissionsData, d => d.Emissions || 0);
  const maxEmission = d3.max(emissionsData, d => d.Emissions);

  const quantileValues = customPercentiles.map(p =>
    d3.quantile(emissionsData.map(d => d.Emissions).filter(d => d != null), p)
  );

  quantileValues.unshift(minEmission);
  quantileValues.push(maxEmission);

  quantileValues.sort((a, b) => a - b);

  const colorScale = scaleQuantile()
    .domain(quantileValues)
    .range([
      "#ffffe0", "#fffb80", "#fff566", "#ffed3e", "#ffdb2d", "#ffcc00",
      "#ffaa00", "#ff8c00", "#ff7300", "#ff5722", "#e64a19", "#d32f2f",
      "#c62828", "#b71c1c"
    ]);

  const svg = container.append("svg")
    .attr("width", width)
    .attr("height", height);

  const mapGroup = svg.append("g");

  function customFormat(value) {
    return value ? `${value.toFixed(2)} t` : "No data";
  }

  const tooltip = createTooltip("tooltip3");

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
    .on("mouseover", (event, d) => {
      const emissions = d.properties.emission;
      tooltip.style("display", "block")
        .style("opacity", 1)
        .html(`<strong>${d.properties.name}</strong><br>
             Emissions: ${emissions ? customFormat(emissions) : "No data"}`);
    })
    .on("mousemove", (event) => {
      tooltip.style("left", (event.pageX + 10) + "px")
             .style("top", (event.pageY - 10) + "px");
    })
    .on("mouseout", () => {
      tooltip.style("display", "none");
    });

  svg.call(insertZoomHandler(mapGroup, height));

  const legendGroup = svg.append("g")
    .attr("transform", `translate(50, 30)`);

  const legendRectWidth = 70;
  const legendRectHeight = 20;
  const legendSpacing = 20;

  updateLegend(legendRectWidth, legendRectHeight, legendGroup, legendSpacing, minEmission, quantileValues, maxEmission, colorScale, customFormat);

  // Handle window resizing
  window.addEventListener("resize", () => {
    const width = container.node().clientWidth;
    const height = container.node().clientHeight;
    svg.attr("width", width).attr("height", height);
    projection.translate([width / 2, height / 2]);
    mapGroup.selectAll("path").attr("d", path);
    updateLegend();
  });
}

createCO2EmissionsMapWorld("MapThreechart");
```
<div id="MapThreechart" style="width: 100%; height: 500px; margin-bottom: 50px;"></div>


<p>

</p>


## Azimuthal Equal Area projection
```js
async function createCO2EmissionsMapWorld(containerId, customPercentiles = [0.25, 0.5, 0.75, 0.95]) {
  const co_emissions_per_capita = await FileAttachment("data/co-emissions-per-capita-filter.csv").csv({ typed: true });

  const emissionsData = await getEmissionsData(co_emissions_per_capita);

  const url = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";
  const worldData = await fetch(url).then(response => response.json());

  const emissionMap = new Map(emissionsData.map(d => [d.Entity, d.Emissions]));

  const countriesWithEmissions = worldData.features.map(feature => {
    let countryName = feature.properties.name;
    countryName = countryNameMapping[countryName] || countryName;

    const emission = emissionMap.get(countryName);
    feature.properties.emission = emission;
    return feature;
  });

  const container = d3.select("#" + containerId);
  const width = container.node().clientWidth;
  const height = container.node().clientHeight;

  // Using conic equidistant projection
  const projection = geoAzimuthalEqualArea()
    .scale(90) // Adjust scale for better fit
    .translate([width / 2, height / 2]) // Center projection in SVG
    .center([0, 0]) // Center map at long 0, lat 20

  const path = geoPath().projection(projection);

  const minEmission = d3.min(emissionsData, d => d.Emissions || 0);
  const maxEmission = d3.max(emissionsData, d => d.Emissions);

  const quantileValues = customPercentiles.map(p =>
    d3.quantile(emissionsData.map(d => d.Emissions).filter(d => d != null), p)
  );

  quantileValues.unshift(minEmission);
  quantileValues.push(maxEmission);

  quantileValues.sort((a, b) => a - b);

  const colorScale = scaleQuantile()
    .domain(quantileValues)
    .range([ 
      "#ffffe0", "#fffb80", "#fff566", "#ffed3e", "#ffdb2d", "#ffcc00",
      "#ffaa00", "#ff8c00", "#ff7300", "#ff5722", "#e64a19", "#d32f2f",
      "#c62828", "#b71c1c"
    ]);

  const svg = container.append("svg")
    .attr("width", width)
    .attr("height", height);

  const mapGroup = svg.append("g");

  function customFormat(value) {
    return value ? `${value.toFixed(2)} t` : "No data";
  }

  const tooltip = createTooltip("tooltip4");

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
    .on("mouseover", (event, d) => {
      const emissions = d.properties.emission;
      tooltip.style("display","block")
        .style("opacity", 1)
        .html(`<strong>${d.properties.name}</strong><br>
             Emissions: ${emissions ? customFormat(emissions) : "No data"}`);
    })
    .on("mousemove", (event) => {
      tooltip.style("left", (event.pageX + 10) + "px")
             .style("top", (event.pageY - 10) + "px");
    })
    .on("mouseout", () => {
      tooltip.style("display", "none");
    });

  // Drag interactions
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
      projection.rotate([rotation[0] + dx / 2, rotation[1] - dy / 2]);
      mapGroup.selectAll("path").attr("d", path);
      lastX = event.x;
      lastY = event.y;
    })
  );

  svg.call(insertZoomHandler(mapGroup, height));

  const legendGroup = svg.append("g")
    .attr("transform", `translate(50, 30)`);

  const legendRectWidth = 70;
  const legendRectHeight = 20;
  const legendSpacing = 20;

  updateLegend(legendRectWidth, legendRectHeight, legendGroup, legendSpacing, minEmission, quantileValues, maxEmission, colorScale, customFormat);

  // Adjust the map and legend on window resize
  window.addEventListener("resize", () => {
    const width = container.node().clientWidth;
    const height = container.node().clientHeight;
    svg.attr("width", width).attr("height", height);
    projection.translate([width / 2, height / 2]);
    mapGroup.selectAll("path").attr("d", path);
    updateLegend();
  });
}

createCO2EmissionsMapWorld("MapFourchart");
```
<div id="MapFourchart" style="width: 100%; height: 500px; margin-bottom: 50px;"></div>

<p>

The *Equal Earth* projection is designed to maintain area accuracy globally, ensuring that countries and continents are displayed in true proportion to their actual landmass size. This makes it a valuable tool for visualizing emissions data in terms of spatial distribution. However, its focus on equal area can inadvertently understate the significance of emissions from smaller but densely populated continents, such as urban centers or island nations. These areas might contribute significantly to global emissions per capita or in total but appear visually minor on the map.

The *Azimuthal Equal Area* projection, by contrast, ensures area equivalency within a localized context, making it ideal for accurately comparing the proportional size of continents. This projection allows users to center the map on a chosen focal point, which provides flexibility in focusing on specific areas. However, the choice of center inherently skews the perception of continents farther from this point. For example, a map centered on **Europe** will accurately display area relationships within and around **Europe** but may visually downplay emissions from continents such as **South America**, **Africa**, or **Oceania** due to their peripheral placement.
This distortion can lead to underestimating the contributions of these distant areas to global emissions. To effectively interpret this map, users should consider how the choice of center influences the visibility and perceived importance of emissions in various continents. Navigating the map to shift the center can help provide a more comprehensive understanding of emissions across different parts of the globe, reducing the potential for bias introduced by the fixed focus of static maps.
</p>