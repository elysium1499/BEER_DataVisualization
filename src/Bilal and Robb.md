---
theme: dashboard
title: Section 3
toc: true
---


```js
import { geoMercator, geoOrthographic, geoPath } from "d3-geo";
import { scaleSequential } from "d3-scale";
import { interpolateYlOrRd } from "d3-scale-chromatic";
import { zoom } from "d3-zoom";

// Shared configurations and constants
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

// Utility to load and process data
async function loadData(aggregation_type) {
    const coEmissions = await FileAttachment("data/co-emissions-per-capita-filter.csv").csv({ typed: true });

    if (aggregation_type === "density") {
        // Return data directly without population consideration
        return coEmissions.filter(d => d.Year === 2022).map(d => ({
            ...d,
            TotalEmissions: d["Annual CO₂ emissions (per capita)"] // Use per-capita emissions directly
        }));
    } else if (aggregation_type === "absolute_value") {
        const populationData = await FileAttachment("data/region_entities_population2022.csv").csv({ typed: true });
        const populationMap = new Map(populationData.map(d => [d.Entity, d.Population2022]));

        // Compute total emissions based on population
        return coEmissions
            .filter(d => d.Year === 2022)
            .map(d => {
                const countryName = countryNameMapping[d.Entity] || d.Entity;
                const population = populationMap.get(countryName);
                const totalEmissions = population ? d["Annual CO₂ emissions (per capita)"] * population : null;

                return { ...d, Population: population, TotalEmissions: totalEmissions };
            });
    } else {
        throw new Error(`Unsupported aggregation_type: ${aggregation_type}`);
    }
}

async function createCO2EmissionsMap(containerId, mapType, aggregation_type = "absolute_value") {
    const data = await loadData(aggregation_type);
    const url = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";
    const worldData = await fetch(url).then(response => response.json());

    const emissionMap = new Map(data.map(d => [d.Entity, d.TotalEmissions]));
    const countriesWithEmissions = worldData.features.map(feature => {
        const countryName = countryNameMapping[feature.properties.name] || feature.properties.name;
        feature.properties.emission = emissionMap.get(countryName);
        return feature;
    });

    const container = d3.select(`#${containerId}`);
    const width = container.node().clientWidth;
    const height = container.node().clientHeight;

    const projection = createProjection(mapType, width, height);
    const path = geoPath().projection(projection);

    const maxEmission = d3.max(data, d => d.TotalEmissions);
    const colorScale = scaleSequential(interpolateYlOrRd).domain([0, maxEmission]);

    const svg = container.append("svg").attr("width", width).attr("height", height);
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
        .text(d => `${d.properties.name}: ${d.properties.emission || "No data"}`);

    if (mapType === "orthographic") {
        addGlobeInteractivity(svg, mapGroup, projection, path);
    } else if (mapType === "mercator") {
        addZoom(svg, mapGroup, width, height);
    }

    addLegend(svg, colorScale, width, height, maxEmission);
}

// Helper function for projections
function createProjection(mapType, width, height) {
    if (mapType === "mercator") {
        return geoMercator().scale(140).translate([width / 2, height / 1.5]);
    } else if (mapType === "orthographic") {
        return geoOrthographic().scale(200).translate([width / 2, height / 2]);
    } else {
        throw new Error(`Unsupported mapType: ${mapType}`);
    }
}

// Zoom functionality
function addZoom(svg, mapGroup, width, height) {
    const zoomHandler = zoom()
        .scaleExtent([1, 8])
        .translateExtent([[-width, -height], [2 * width, 2 * height]])
        .on("zoom", (event) => mapGroup.attr("transform", event.transform));
    svg.call(zoomHandler);
}

// Globe interactivity
function addGlobeInteractivity(svg, mapGroup, projection, path) {
    let isDragging = false;
    let lastPosition = null;

    svg.on("mousedown", (event) => {
        isDragging = true;
        lastPosition = [event.clientX, event.clientY];
    });

    svg.on("mousemove", (event) => {
        if (isDragging) {
            const [dx, dy] = [event.clientX - lastPosition[0], event.clientY - lastPosition[1]];
            projection.rotate([projection.rotate()[0] + dx / 5, projection.rotate()[1] - dy / 5]);
            mapGroup.selectAll("path").attr("d", path);
            lastPosition = [event.clientX, event.clientY];
        }
    });

    svg.on("mouseup mouseleave", () => (isDragging = false));
}

// Add legend
function addLegend(svg, colorScale, width, height, maxEmission) {
    const legendWidth = 300;
    const legendHeight = 20;

    const legendGroup = svg.append("g")
        .attr("transform", `translate(${(width - legendWidth) / 2}, ${height - 50})`);

    const defs = svg.append("defs");
    const linearGradient = defs.append("linearGradient").attr("id", "legend-gradient");

    linearGradient.selectAll("stop")
        .data(colorScale.ticks(10).map((t, i, n) => ({
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

    const legendScale = d3.scaleLinear()
        .domain([0, maxEmission])
        .range([0, legendWidth]);

    legendGroup.append("g")
        .attr("transform", `translate(0, ${legendHeight})`)
        .call(d3.axisBottom(legendScale).ticks(3).tickFormat(d => (d / 1e9).toFixed(2) + "B"))
        .select(".domain").remove();
}

createCO2EmissionsMap("MapOnechart", "mercator", "absolute_value");
createCO2EmissionsMap("MapTwochart", "orthographic", "absolute_value");
createCO2EmissionsMap("MapThreechart", "mercator", "density");
createCO2EmissionsMap("MapFourchart", "orthographic", "density");
```


# CO₂ Emissions Map 🌍
## Plot 1
<div id="MapOnechart" style="width: 100%; height: 600px; margin-bottom: 50px;"></div>
<p>parole parole parole</p>

## Plot 2
<div id="MapTwochart" style="width: 100%; height: 500px; margin-bottom: 50px;"></div>
<p>parole parole parole</p>

## Plot 3
<div id="MapThreechart" style="width: 100%; height: 600px; margin-bottom: 50px;"></div>
<p>parole parole parole</p>

## Plot 4
<div id="MapFourchart" style="width: 100%; height: 500px; margin-bottom: 50px;"></div>
<p>parole parole parole</p>

