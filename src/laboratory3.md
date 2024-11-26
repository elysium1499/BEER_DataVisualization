---
theme: dashboard
title: Don't get confused by maps
toc: true
---


# CO₂ Emissions Map 🌍

<br>

## Mercator

<br>

```js
import { geoMercator, geoOrthographic, geoPath } from "d3-geo";
import { scaleSequential } from "d3-scale";
import { interpolateYlOrRd } from "d3-scale-chromatic";
import { zoom } from "d3-zoom";

async function createCO2EmissionsMapWorld(containerId, customPercentiles = [0.25, 0.5, 0.75, 0.95]) {
  const co_emissions_per_capita = await FileAttachment("data/co-emissions-per-capita-filter.csv").csv({ typed: true });
  const region_population = await FileAttachment("data/region_entities_population2022.csv").csv({ typed: true });

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

  const populationMap = new Map(region_population.map(d => [d.Entity, d.Population2022]));

  const emissionsWithPopulation = co_emissions_per_capita.filter(d => d.Year === 2022).map(d => {
    let countryName = d.Entity;
    countryName = countryNameMapping[countryName] || countryName;
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
    const population = populationMap.get(countryName);
    const totalEmissions = population ? d["Annual CO₂ emissions (per capita)"] * population : null;
    return {
      ...d,
      Population: population,
      TotalEmissions: totalEmissions,
    };
  });

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
  const width = container.node().clientWidth;
  const height = container.node().clientHeight;

  const projection = d3.geoMercator()
    .scale(90)
    .translate([(width / 2) - 90, height / 1.5]);

  const path = geoPath().projection(projection);

  const minEmission = d3.min(topEmissions, d => d.TotalEmissions || 0);
  const maxEmission = d3.max(topEmissions, d => d.TotalEmissions);

  // Calculate the quantiles based on the customPercentiles parameter
  const quantileValues = customPercentiles.map(p => d3.quantile(topEmissions.map(d => d.TotalEmissions).filter(d => d != null), p));

  quantileValues.unshift(minEmission);
  quantileValues.push(maxEmission);

  quantileValues.sort((a, b) => a - b);

  // Use d3.scaleQuantile for quantile-based color scaling
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
    return (value / 1e9).toFixed(2) + " Billion Tons";
    return (value / 1e9).toFixed(2) + " Billion Tons";
  }

  // Draw the map
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

  // Zoom and pan functionality
  const zoomHandler = zoom()
    .scaleExtent([1, 8])
    .translateExtent([[-width, -height], [2 * width, 2 * height]])
    .on("zoom", (event) => {
      mapGroup.attr("transform", event.transform);
    });

  svg.call(zoomHandler);

  // Add the legend group (positioned on the right)
  const legendWidth = 150;
  const legendHeight = 350;
  const legendRectSize = 20;
  const legendSpacing = 5;

  const legendGroup = svg.append("g")
    .attr("transform", `translate(${width - 170}, ${height - legendHeight - 50})`);

  function updateLegend() {
    // Create the legend breaks based on quantiles
    const quantileBreaks = [minEmission, ...quantileValues, maxEmission];

    // Remove any existing rectangles and labels in the legend group
    legendGroup.selectAll("*").remove();

    // Draw the legend rectangles vertically (matching the number of quantile breaks)
    legendGroup.selectAll("rect")
      .data(quantileBreaks.slice(0, -1))  // Exclude the last quantile for the rectangles
      .join("rect")
      .attr("x", 0)
      .attr("y", (d, i) => i * (legendRectSize + legendSpacing))
      .attr("width", legendRectSize)
      .attr("height", legendRectSize)
      .style("fill", (d, i) => colorScale(d));

    // Add labels with emission * population range
    legendGroup.selectAll("text")
      .data(quantileBreaks.slice(0, -1))  // Exclude the last quantile for the labels
      .join("text")
      .attr("x", legendRectSize + 5)
      .attr("y", (d, i) => i * (legendRectSize + legendSpacing) + legendRectSize / 2)
      .attr("text-anchor", "start")
      .style("font-size", "12px")
      .style("fill", "white") // Text color
      .text((d, i) => {
        const lower = quantileBreaks[i];
        const upper = quantileBreaks[i + 1];
        return `${(lower / 1e9).toFixed(5) + " Bt"} - ${(upper / 1e9).toFixed(5) + " Bt"}`;
      });
  }

  // Initial legend rendering
  updateLegend();
}

// Crea la mappa
createCO2EmissionsMapWorld("MapOnechart");


```
<div id="MapOnechart" style="width: 100%; height: 600px; margin-bottom: 50px;"></div>

<p>
parole parole parole
</p>

## Orthografic
```js

async function createCO2EmissionsMapEarth(containerId) {
  // Load datasets
  const co_emissions_per_capita = await FileAttachment("data/co-emissions-per-capita-filter.csv").csv({ typed: true });
  const region_population = await FileAttachment("data/region_entities_population2022.csv").csv({ typed: true });

  // Transform the population dataset into a map
  const populationMap = new Map(region_population.map(d => [d.Entity, d.Population2022]));

  // Calculate total emissions for each country
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

  // Projection and path
  const projection = d3.geoOrthographic()
    .scale(180)
    .translate([(width / 2) - 50, height / 2]);
  const path = d3.geoPath().projection(projection);

  // Create SVG and map group
  const svg = container.append("svg")
    .attr("width", width)
    .attr("height", height);

  const mapGroup = svg.append("g");

  // Custom formatting function
  function customFormat(value) {
    return (value / 1e9).toFixed(2) + " Billion Tons";
    return (value / 1e9).toFixed(2) + " Billion Tons";
  }

  // Draw the map
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

  // Drag and zoom interactions
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
      lastX = event.x;
      lastY = event.y;
    })
  );

  const zoomHandler = d3.zoom()
    .scaleExtent([0.5, 8])
    .on("zoom", (event) => {
      mapGroup.attr("transform", event.transform);
    });
  svg.call(zoomHandler);


  // Add the legend group (positioned on the right)
  const legendWidth = 150;
  const legendHeight = 350;
  const legendRectSize = 20;
  const legendSpacing = 5;

  const legendGroup = svg.append("g")
    .attr("transform", `translate(${width - 170}, ${height - legendHeight - 50})`);

  function updateLegend() {
    // Create the legend breaks based on quantiles
    const quantileBreaks = [minEmission, ...quantileValues, maxEmission];

    // Remove any existing rectangles and labels in the legend group
    legendGroup.selectAll("*").remove();

    // Draw the legend rectangles vertically (matching the number of quantile breaks)
    legendGroup.selectAll("rect")
      .data(quantileBreaks.slice(0, -1))  // Exclude the last quantile for the rectangles
      .join("rect")
      .attr("x", 0)
      .attr("y", (d, i) => i * (legendRectSize + legendSpacing))
      .attr("width", legendRectSize)
      .attr("height", legendRectSize)
      .style("fill", (d, i) => colorScale(d));

    // Add labels with emission * population range
    legendGroup.selectAll("text")
      .data(quantileBreaks.slice(0, -1))  // Exclude the last quantile for the labels
      .join("text")
      .attr("x", legendRectSize + 5)
      .attr("y", (d, i) => i * (legendRectSize + legendSpacing) + legendRectSize / 2)
      .attr("text-anchor", "start")
      .style("font-size", "12px")
      .style("fill", "white") // Text color
      .text((d, i) => {
        const lower = quantileBreaks[i];
        const upper = quantileBreaks[i + 1];
        return `${(lower / 1e9).toFixed(5) + " Bt"} - ${(upper / 1e9).toFixed(5) + " Bt"}`;
      });
  }

  // Initial legend rendering
  updateLegend();
}



// Crea la mappa
createCO2EmissionsMapEarth("MapTwochart");



```
<div id="MapTwochart" style="width: 100%; height: 500px; margin-bottom: 50px;"></div>

<p>
parole parole parole
</p>