---
theme: dashboard
title: Section 2
toc: true
---

```js
//column: Entity,Region,Code,Year,Annual CO₂ emissions,Annual CO₂ emissions from land-use change,Annual CO₂ emissions from fossil fuel
const datasetFossil = await FileAttachment("data/co2-fossil-plus-land-use.csv").csv({ typed: true });
```


# Alluvial
<br>

## Data and Chart Setup

```js
// Import necessary D3 libraries
const [d3, { sankey, sankeyLinkHorizontal }] = await Promise.all([
  import("https://cdn.jsdelivr.net/npm/d3@7/+esm"),
  import("https://cdn.jsdelivr.net/npm/d3-sankey@0.12/+esm")
]);


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
    if (d["Annual CO₂ emissions from fossil fuel"] > 0) {
      links.push({
        source: countryName,
        target: "Fossil Use",
        value: d["Annual CO₂ emissions from fossil fuel"]
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

  // Create an SVG element
  const svg = d3.create("svg")
    .attr("viewBox", [-30, -30, width , height])
    .attr("width", width -50)
    .attr("height", height)
    .style("min-height", "640px")
    .style("font", "10px sans-serif");

  // Create a tooltip div that is hidden by default
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "rgba(0, 0, 0, 0.7)")
    .style("color", "white")
    .style("padding", "5px 10px")
    .style("border-radius", "4px")
    .style("font-size", "12px")
    .style("pointer-events", "none")
    .style("display", "none");

  svg.append("g")
    .selectAll("rect")
    .data(sankeyNodes)
    .join("rect")
    .attr("x", d => d.x0)
    .attr("y", d => d.y0)
    .attr("height", d => d.y1 - d.y0)
    .attr("width", d => d.x1 - d.x0)
    .attr("fill", d => color(d.name))
    .style("opacity", 0.7)
    .on("mouseover", function(event, d) {
      d3.select(this).style("opacity", 1);
      tooltip.style("display", "block")
        .html(`<strong>${d.name}</strong>`);
    })
    .on("mousemove", event => {
      tooltip.style("top", `${event.pageY + 10}px`)
        .style("left", `${event.pageX + 10}px`);
    })
    .on("mouseout", function() {
      d3.select(this).style("opacity", 0.7);
      tooltip.style("display", "none");
    });

  svg.append("g")
  .attr("fill", "none")
  .selectAll("path")
  .data(sankeyLinks)
  .join("path")
  .attr("d", sankeyLinkHorizontal())
  .attr("stroke", d => color(d.source.name))
  .attr("stroke-width", d => Math.max(1, d.width))
  .attr("opacity", 0.5)
  .on("mouseover", function(event, d) {
    d3.select(this).attr("opacity", 0.8);

    // Verifica il tipo di collegamento basandosi sui nodi di origine e destinazione
    if (continentNodes.some(node => node.name === d.source.name) &&
        countryNodes.some(node => node.name === d.target.name)) {
        tooltip.style("display", "block").html(`<strong>${d.source.name} → ${d.target.name}</strong>`);
    } else if (countryNodes.some(node => node.name === d.source.name) && typeNodes.some(node => node.name === d.target.name)) {
        tooltip.style("display", "block").html(`<strong>${d.source.name} → Value: ${(d.value / 1_000_000_000).toLocaleString()} BT </strong>`);
    }
  })
  .on("mousemove", event => {
    tooltip.style("top", `${event.pageY + 10}px`)
      .style("left", `${event.pageX + 10}px`);
  })
  .on("mouseout", function() {
    d3.select(this).attr("opacity", 0.5);
    tooltip.style("display", "none");
  });

  svg.append("text")
    .attr("x", 0)
    .attr("y", -20)
    .attr("text-anchor", "start")
    .style("font-weight", "bold")
    .style("fill", "white")
    .style("font-size", "16px")
    .text("Region");

  svg.append("text")
    .attr("x", width * 0.5)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .style("font-weight", "bold")
    .style("fill", "white")
    .style("font-size", "16px")
    .text("Country");

  svg.append("text")
    .attr("x", width)
    .attr("y", -20)
    .attr("text-anchor", "end")
    .style("font-weight", "bold")
    .style("fill", "white")
    .style("font-size", "16px")
    .text("Emission");

  return svg.node();

}

```

<div class="grid grid-cols-1"> 
  <div class="card"> ${resize((width) =>ContinentCountryEmissionSankeyChart(dataYear2000, width))}</div> 
</div>

<p>

This chart offers a detailed visualization of CO₂ emissions for the year 2022, providing valuable insights into the primary sources of global CO₂ emissions.

Each continent’s total CO₂ emissions are represented by flows, with larger flows indicating greater emissions.

Emission flows split further to individual countries. More significant flows indicate higher national emissions.
Major emitters like the **United States**, **China**, and **Brazil** dominate the chart, reflecting their status as some of the largest contributors to global CO₂ emissions.

The chart divides emissions into two primary categories on the right: **Fossil Fuel Use** and **Land Use**.
Countries such as the **United States** and **China** show significant flows linked to **Fossil Fuel Use**, highlighting their dependence on coal, oil, and natural gas.
In contrast, nations like **Brazil** and other countries in South America exhibit stronger connections to **Land Use** emissions, reflecting the impact of deforestation and land management practices.

**Indonesia** and **Russia** also contribute significantly to global emissions, though their flows are smaller compared to top emitters like the U.S. and China.

</p>

