---
theme: dashboard
title: Fossil vs Land
toc: true
---

```js
//column: Entity,Region,Code,Year,Annual CO₂ emissions,Annual CO₂ emissions from land-use change,Annual CO₂ emissions from fossil fuel
const datasetFossil = await FileAttachment("data/co2-fossil-plus-land-use.csv").csv({ typed: true });
```


# Fossil 🆚 Land
<br>

## How CO₂ emissions are split between Fossil Fuel and Land Use

```js
// Import necessary D3 libraries
const [d3, { sankey, sankeyLinkHorizontal }] = await Promise.all([
  import("https://cdn.jsdelivr.net/npm/d3@7/+esm"),
  import("https://cdn.jsdelivr.net/npm/d3-sankey@0.12/+esm")
]);


// Filter data for the year 2000 and select top 30 countries by CO₂ emissions
const dataYear2022 = datasetFossil
  .filter(d => d.Year === 2022)  // Filter for the year 2000
  .sort((a, b) => b["Annual CO₂ emissions"] - a["Annual CO₂ emissions"])  // Sort by emissions, descending
  .slice(0, 30);  // Select top 30 countries
console.log("Data for year 2000:", dataYear2022);  // Check filtered data

// Define the chart function to connect continents to countries and countries to emission types
function ContinentCountryEmissionSankeyChart(data, width, height = 600) {
  const continentNodes = [];  // Layer 1: Continent nodes
  const countryNodes = [];    // Layer 2: Country nodes
  const typeNodes = [{ name: "Fossil Fuel" }, { name: "Land Use" }];  // Layer 3: Emission types
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
        target: "Fossil Fuel",
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
    .extent([[1, 1], [width - 30, height + 60]])({
      nodes: nodes.map(d => ({ ...d })),
      links: links.map(d => ({
        source: nodes.findIndex(n => n.name === d.source),
        target: nodes.findIndex(n => n.name === d.target),
        value: d.value
      }))
    });

  // Create an SVG element
  const svg = d3.create("svg")
    .attr("viewBox", [-60, -60, width , height + 150])
    .attr("width", width -70)
    .attr("height", height )
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
    .text("Continent");

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

svg.append("g")
  .selectAll("text")
  .data(sankeyNodes.filter(d => 
    continentNodes.some(node => node.name === d.name) || 
    typeNodes.some(node => node.name === d.name)        
  ))
  .join("text")
  .attr("x", d => d.x0 < width / 2 ? d.x0 - 5 : d.x1 + 5) 
  .attr("y", d => (d.y0 + d.y1) / 2) 
  .attr("dy", "0.35em") 
  .attr("text-anchor", d => d.x0 < width / 2 ? "end" : "start") 
  .attr("transform", d => {
    const x = d.x0 < width / 2 ? d.x0 - 5 : d.x1 + 5; 
    const y = (d.y0 + d.y1) / 2;                 
    return `rotate(0, ${x}, ${y})`;               
  })
  .style("fill", "white")
  .style("font-size", "13px")
  .text(d => d.name);


  return svg.node();

}

```

<div class="grid grid-cols-1"  style="width: 100%; max-width: 1400px;"> 
  <div class="card"> ${resize((width) =>ContinentCountryEmissionSankeyChart(dataYear2022, width))}</div> 
</div>

<p>

This chart offers a detailed visualization of CO₂ emissions for the year 2022, providing valuable insights into the primary sources of global CO₂ emissions.

On the left, continents are shown as the primary sources of emissions. **Asia** dominates, driven by substantial industrial activity and energy demand in countries like **China** and **India**. **North America**, led by the **United States**, also contributes significantly, while **Europe** reflects a more moderate share, likely due to its adoption of renewable energy and stricter climate policies.

In the center, the chart links continents to countries, emphasizing the top emitters. **China** and the **United States** lead, primarily due to their heavy reliance on fossil fuels. Emerging economies like **India** also feature prominently, reflecting growing industrialization and energy needs.

On the right, emissions are divided into two categories: fossil fuel and land use. Fossil fuel emissions dominate globally, while land-use emissions, though smaller, are significant in continents like **South America** and **Africa**, where deforestation and agricultural practices play a key role.

</p>

