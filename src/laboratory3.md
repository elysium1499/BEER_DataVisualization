---
theme: dashboard
title: Don't get confused by maps
toc: true
---

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

  // Remove any existing legend elements
  legendGroup.selectAll("*").remove();

  // Draw the legend rectangles
  legendGroup.selectAll("rect")
    .data(quantileBreaks.slice(0, -1))
    .join("rect")
    .attr("x", (d, i) => i * (legendRectWidth + legendSpacing))
    .attr("y", 0)
    .attr("width", legendRectWidth)
    .attr("height", legendRectHeight)
    .style("fill", (d, i) => colorScale(d));

  // Add the text labels for each quantile
  legendGroup.selectAll("text")
    .data(quantileBreaks.slice(0, -1))
    .join("text")
    .attr("x", (d, i) => i * (legendRectWidth + legendSpacing) + legendRectWidth / 2) // Center the text below each rect
    .attr("y", legendRectHeight + 15) // Move the text below the color box
    .attr("text-anchor", "middle") // Center the text
    .style("fill", "white")
    .style("font-size", "9px")
    .text((d, i) => {
      const lower = quantileBreaks[i];
      const upper = quantileBreaks[i + 1];
      return `${customFormat(lower)} - ${customFormat(upper)}`;
    });
}

function insertZoomHandler(mapGroup, height){
  return zoom().scaleExtent([1, 8]).translateExtent([[-width, -height], [2 * width, 2 * height]]).on("zoom", (event) => {
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
  const width = container.node().clientWidth;
  const height = container.node().clientHeight;

  const projection = geoMercator().scale(100).translate([(width / 2), height / 1.5]);
  const path = geoPath().projection(projection);

  const minEmission = d3.min(topEmissions, d => d.TotalEmissions || 0);
  const maxEmission = d3.max(topEmissions, d => d.TotalEmissions);

  const quantileValues = customPercentiles.map(p => d3.quantile(topEmissions.map(d => d.TotalEmissions).filter(d => d != null), p));

  quantileValues.unshift(minEmission);
  quantileValues.push(maxEmission);
  quantileValues.sort((a, b) => a - b);

  const colorScale = scaleQuantile().domain(quantileValues).range([
    "#ffffe0", "#fffb80", "#fff566", "#ffed3e", "#ffdb2d", "#ffcc00",
    "#ffaa00", "#ff8c00", "#ff7300", "#ff5722", "#e64a19", "#d32f2f",
    "#c62828", "#b71c1c"
  ]);

  const svg = container.append("svg").attr("width", width).attr("height", height);
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

  svg.call(insertZoomHandler(mapGroup, height));

  // Create the legend group below the map (outside the chart area)
  const legendGroup = svg.append("g").attr("transform", `translate(50, 30)`);

  const legendRectWidth = 70;
  const legendRectHeight = 20;
  const legendSpacing = 20;

  updateLegend(legendRectWidth, legendRectHeight, legendSpacing, legendGroup, minEmission, quantileValues, maxEmission, colorScale, customFormat);
}

// Create the map
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
  quantileValues.sort((a, b) => a - b);

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

  // Add the legend group
  const legendRectWidth = 70;  // Width of the rectangles
  const legendRectHeight = 20; // Height of the rectangles
  const legendSpacing = 20;

  const legendGroup = svg.append("g").attr("transform", `translate(50,30)`);

  updateLegend(legendRectWidth, legendRectHeight, legendGroup, legendSpacing, minEmission, quantileValues, maxEmission, colorScale, customFormat)

}

// Crea la mappa
createCO2EmissionsMapEarth("MapTwochart");

```
<div id="MapTwochart" style="width: 100%; height: 500px; margin-bottom: 50px;"></div>

<p>
In the Mercator projection, northern countries like the USA, Russia, and Canada are represented with inflated sizes, giving a visual impression that these continents have a disproportionately large impact on emissions. This distortion occurs because the Mercator projection stretches areas farther from the equator to maintain angular accuracy, which is useful for navigation but misleading for visualizing data distribution.

On the other hand, the Orthographic projection provides a more visually balanced representation by simulating a globe viewed from a specific perspective. While this projection reduces the distortion of landmass sizes compared to Mercator, it introduces its own biases. Central continents in the chosen perspective appear larger and more prominent, potentially drawing attention to their emissions while downplaying those from continents located at the periphery of the map, such as parts of Africa, South America, or Oceania. Understanding these projection biases is crucial when interpreting maps to avoid misjudging the relative contributions of different continents to CO2 emissions.
</p>

<br>

<p>
These maps shift the focus from absolute values to emissions normalized per person. This is crucial for understanding individual-level contributions and comparing nations with vastly different population sizes. However, here too, map distortions might confuse viewers.
</p>

## Equal Earth projection

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
      return `${d.properties.name}: ${customFormat(emissions)}`;
    });

  svg.call(insertZoomHandler(mapGroup, height));


  const legendGroup = svg.append("g").attr("transform", `translate(50, 30)`);

  const legendRectWidth = 70;
  const legendRectHeight = 20;
  const legendSpacing = 20;

  updateLegend(legendRectWidth, legendRectHeight, legendGroup, legendSpacing, minEmission, quantileValues, maxEmission, colorScale, customFormat)

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

  const colorScale = scaleQuantile().domain(quantileValues).range([
    "#ffffe0", "#fffb80", "#fff566", "#ffed3e", "#ffdb2d", "#ffcc00",
    "#ffaa00", "#ff8c00", "#ff7300", "#ff5722", "#e64a19", "#d32f2f",
    "#c62828", "#b71c1c"
  ]);

  const svg = container.append("svg").attr("width", width).attr("height", height);

  const mapGroup = svg.append("g");

  function customFormat(value) {
    return value ? `${value.toFixed(2)} t` : "No data";
  }

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
      return `${d.properties.name}: ${customFormat(emissions)}`;
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


  const legendGroup = svg.append("g").attr("transform", `translate(50, 30)`);

  const legendRectWidth = 70;
  const legendRectHeight = 20;
  const legendSpacing = 20;

  updateLegend(legendRectWidth, legendRectHeight, legendGroup, legendSpacing, minEmission, quantileValues, maxEmission, colorScale, customFormat)
}

createCO2EmissionsMapWorld("MapFourchart");
```
<div id="MapFourchart" style="width: 100%; height: 500px; margin-bottom: 50px;"></div>

<p>
The Equal Earth projection is designed to maintain area accuracy globally, ensuring that countries and continents are displayed in true proportion to their actual landmass size. This makes it a valuable tool for visualizing emissions data in terms of spatial distribution. However, its focus on equal area can inadvertently understate the significance of emissions from smaller but densely populated continents, such as urban centers or island nations. These areas might contribute significantly to global emissions per capita or in total but appear visually minor on the map.

The Azimuthal Equal Area projection, by contrast, ensures area equivalency within a localized context, making it ideal for accurately comparing the proportional size of continents. This projection allows users to center the map on a chosen focal point, which provides flexibility in focusing on specific areas. However, the choice of center inherently skews the perception of continents farther from this point. For example, a map centered on Europe will accurately display area relationships within and around Europe but may visually downplay emissions from continents such as South America, Africa, or Oceania due to their peripheral placement.
This distortion can lead to underestimating the contributions of these distant areas to global emissions. To effectively interpret this map, users should consider how the choice of center influences the visibility and perceived importance of emissions in various continents. Navigating the map to shift the center can help provide a more comprehensive understanding of emissions across different parts of the globe, reducing the potential for bias introduced by the fixed focus of static maps.
</p>