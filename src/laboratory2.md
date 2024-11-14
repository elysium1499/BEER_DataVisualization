---
theme: dashboard
title: Laboratory Two
toc: true
---

# Section 2: Alluvial
<br>

## Data and Chart Setup

```js
// Import necessary D3 libraries
const [d3, { sankey, sankeyLinkHorizontal }] = await Promise.all([
  import("https://cdn.jsdelivr.net/npm/d3@7/+esm"),
  import("https://cdn.jsdelivr.net/npm/d3-sankey@0.12/+esm")
]);

// Load and process the dataset
const datasetFossil = await FileAttachment("data/new_filtered_co2_data.csv").csv({ typed: true });
console.log("Loaded data:", datasetFossil);  // Check if data is loaded

// Filter data for the year 2000 and select top 30 countries by CO₂ emissions
const dataYear2000 = datasetFossil
  .filter(d => d.Year === 2000)  // Filter for the year 2000
  .sort((a, b) => b["Annual CO₂ emissions"] - a["Annual CO₂ emissions"])  // Sort by emissions, descending
  .slice(0, 30);  // Select top 30 countries
console.log("Data for year 2000:", dataYear2000);  // Check filtered data

// Define the chart function to connect continents to countries and countries to emission types
function ContinentCountryEmissionSankeyChart(data, width, height = 600) {
  const continentNodes = [];  // Layer 1: Continent nodes
  const countryNodes = [];    // Layer 2: Country nodes
  const typeNodes = [{ name: "Fossil Use" }, { name: "Land Use" }];  // Layer 3: Emission types
  const links = [];

  // Step 1: Create unique continent nodes
  const uniqueContinents = Array.from(new Set(data.map(d => d.Region)));
  uniqueContinents.forEach(continent => {
    continentNodes.push({ name: continent });
  });

  // Step 2: Create country nodes and links from continent to country
  data.forEach(d => {
    const countryName = d.Entity;
    const continentName = d.Region;

  // Add country node if it doesn't exist
  if (!countryNodes.some(node => node.name === countryName)) {
    countryNodes.push({ name: countryName });
  }


    // Create link from continent to country based on total emissions
    links.push({
      source: continentName,
      target: countryName,
      value: d["Annual CO₂ emissions"]
    });
  });

  // Step 3: Link each country to "Fossil Use" and "Land Use" nodes for specific emission types
  data.forEach(d => {
    const countryName = d.Entity;

    // Link to Fossil emissions if applicable
    if (d["Annual CO₂ emissions"] > 0) {
      links.push({
        source: countryName,
        target: "Fossil Use",
        value: d["Annual CO₂ emissions"]
      });
    }

    // Link to Land Use emissions if applicable
    if (d["Annual CO₂ emissions from land-use change"] > 0) {
      links.push({
        source: countryName,
        target: "Land Use",
        value: d["Annual CO₂ emissions from land-use change"]
      });
    }
  });

  // Combine nodes for Sankey setup
  const nodes = [...continentNodes, ...countryNodes, ...typeNodes];

  // Set up the Sankey diagram
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  const { nodes: sankeyNodes, links: sankeyLinks } = sankey()
    .nodeWidth(30)
    .nodePadding(7)
    .extent([[1, 1], [width - 1, height - 6]])({
      nodes: nodes.map(d => ({ ...d })),
      links: links.map(d => ({
        source: nodes.findIndex(n => n.name === d.source),
        target: nodes.findIndex(n => n.name === d.target),
        value: d.value
      }))
    });

  // Create the SVG element
  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("height", height)
    .style("min-height", "600px")
    .style("font", "10px sans-serif");

  // Add nodes
  svg.append("g")
    .selectAll("rect")
    .data(sankeyNodes)
    .join("rect")
    .attr("x", d => d.x0)
    .attr("y", d => d.y0)
    .attr("height", d => d.y1 - d.y0)
    .attr("width", d => d.x1 - d.x0)
    .attr("fill", d => color(d.name))
    .append("title")
    .text(d => `${d.name}\n${d.value ? d.value.toLocaleString() : ""}`);

  // Add links
  svg.append("g")
    .attr("fill", "none")
    .selectAll("path")
    .data(sankeyLinks)
    .join("path")
    .attr("d", sankeyLinkHorizontal())
    .attr("stroke", d => color(d.source.name))
    .attr("stroke-width", d => Math.max(1, d.width))
    .attr("opacity", 0.5)
    .append("title")
    .text(d => `${d.source.name} → ${d.target.name}\n${d.value.toLocaleString()}`);

  // Add text labels
  svg.append("g")
    .style("font", "10px sans-serif")
    .selectAll("text")
    .data(sankeyNodes)
    .join("text")
    .attr("x", d => (d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6))
    .attr("y", d => (d.y0 + d.y1) / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", d => (d.x0 < width / 2 ? "start" : "end"))
    .text(d => d.name);

  return svg.node();
}

```

<div class="grid grid-cols-1"> 
  <div class="card"> ${ContinentCountryEmissionSankeyChart(dataYear2000, 800)}</div> 
</div>