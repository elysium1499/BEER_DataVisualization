---
theme: dashboard
title: Robb - Bilal 2
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
    return scaleSequential(interpolateScheme).domain([0, maxEmission]);
}

function createProjection(width, height, type = "Mercator") {
    return type === "Orthographic"
        ? geoOrthographic().scale(Math.min(width, height) / 2.5).translate([width / 2, height / 2])
        : geoMercator().scale(Math.min(width, height) / 1.5).translate([width / 2, height / 1.5]);
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
    const path = geoPath().projection(projection);
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
    .attr("stroke", "black") // Set the border color
    .attr("stroke-width", 0.2) // Define border thickness
    .on("mouseover", function () {
        d3.select(this).attr("stroke-width", 2).attr("stroke", "yellow"); // Highlight on hover
    })
    .on("mouseout", function () {
        d3.select(this).attr("stroke-width", 0.5).attr("stroke", "black"); // Revert on mouse out
    })
    .append("title")
    .text(d => {
        const emissions = d.properties.emission;
        return `${d.properties.name}: ${emissions ? customFormat(emissions) : "No data"}`;
    });


    return { svg, mapGroup };
}

function addZoom(svg, mapGroup, width, height) {
    const zoomHandler = zoom()
        .scaleExtent([1, 4]) // Restrict zoom levels
        .translateExtent([[0, 0], [width, height]]) // Restrict panning to the visible area
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
        projectionType = "Mercator",
        colorScheme = interpolateYlOrRd,
        customFormat = value => (value / 1_000_000_000).toFixed(4) + " Billion Tons",
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
    const projection = createProjection(width, height, projectionType);

    const { svg, mapGroup } = drawMap(container, countriesWithEmissions, projection, colorScale, customFormat);

    addZoom(svg, mapGroup, width, height);
    addLegend(svg, colorScale, width, height, customFormat);
}

// Create Flat Map
createCO2EmissionsMapWorld("MapOnechart", {
    populationData: region_population,
    emissionsData: co_emissions_per_capita,
    countryNameMapping: countryNameMapping,
    geoJSONUrl: "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson",
});

// Create Globe Map
createCO2EmissionsMapWorld("MapTwochart", {
    populationData: region_population,
    emissionsData: co_emissions_per_capita,
    countryNameMapping: countryNameMapping,
    geoJSONUrl: "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson",
    projectionType: "Orthographic", // Switch to globe projection
});

```
<div id="MapOnechart" role="region" aria-label="CO₂ Emissions Map - Flat" style="width: 100%; height: 600px; margin-bottom: 50px;"></div>



<div id="MapTwochart" role="region" aria-label="CO₂ Emissions Map - Globe" style="width: 100%; height: 500px; margin-bottom: 50px;"></div>


