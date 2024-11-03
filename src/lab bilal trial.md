---
theme: dashboard
title: Bilal Trial
toc: false
---

### Best 20 Capita with low CO₂ Emissions in 2000 🌍

<!-- Load and transform the data -->
```js
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
const dataset = FileAttachment("data/co-emissions-per-capita.csv").csv({typed: true});
```

<!-- BarPlot that show the emission and the country in one year -->

```js
function EmissionsByCapitalYear(data, {width = 800} = {}) { 
  const filteredData = data
    .filter(d => d.Year === 2000)
    .map(d => ({
      city: d.Entity,
      co2Emissions: +d["Annual CO₂ emissions (per capita)"]
    }))
    .sort((a, b) => a.co2Emissions - b.co2Emissions)
    .slice(0, 20);

  return Plot.plot({
    height: 400,
    width,
    marginLeft: 60,
    marginBottom: 100,
    x: {
      label: "City",
      domain: filteredData.map(d => d.city),
      tickRotate: -45,
      tickSize: 10 
    },
    y: {
      label: "Annual CO₂ Emissions (per capita)",
      grid: true
    },
    marks: [
      Plot.barY(filteredData, {x: "city", y: "co2Emissions", fill: "steelblue"})
    ]
  });
}

```

<div class="grid grid-cols-1"> 
  <div class="card"> ${resize((width) => EmissionsByCapitalYear(dataset, {width}))} </div> 
</div>




<!-- BarPlot that show the emission and the country in one decade -->


<!-- BarPlot that show the emission and the country with high emission -->

### Best 20 Capita with high CO₂ Emissions 🌍

```js
// Function for Best 20 Capita with high CO₂ Emissions 🌍
function EmissionsByCapitalDecade(data, { width = 800 } = {}) {
    const totalEmissionsMap = data.reduce((acc, d) => {
        const city = d.Entity;
        const emissions = +d["Annual CO₂ emissions (per capita)"];
        if (!acc[city]) acc[city] = 0;
        acc[city] += emissions;
        return acc;
    }, {});

    const topCities = Object.entries(totalEmissionsMap)
        .map(([city, co2Emissions]) => ({ city, co2Emissions }))
        .sort((a, b) => b.co2Emissions - a.co2Emissions)
        .slice(0, 20);

    const colorScale = d3.scaleSequential(d3.interpolateSpectral)
        .domain([Math.max(...topCities.map(d => d.co2Emissions)), Math.min(...topCities.map(d => d.co2Emissions))]);

    return Plot.plot({
        height: 400,
        width,
        marginLeft: 150,
        marginBottom: 60,
        x: {
            label: "Total CO₂ Emissions (per capita)",
            grid: true,
            nice: true
        },
        y: {
            domain: topCities.map(d => d.city),
            label: null
        },
        marks: [
            Plot.barX(topCities, {
                x: "co2Emissions",
                y: "city",
                fill: d => colorScale(d.co2Emissions),
                className: "hover-bar"
            }),
            Plot.text(topCities, {
                x: d => d.co2Emissions / 2, // Position text in the middle of the bar
                y: "city",
                text: d => d.co2Emissions.toFixed(2),
                textAnchor: "middle",
                fill: "#000",
                opacity: 0,
                fontSize: 20,
                className: "hover-label"
            })
        ],
        // Function to handle hover interactions
        decorate(svg) {
            const labels = svg.querySelectorAll(".hover-label");
            svg.querySelectorAll(".hover-bar").forEach((bar, i) => {
                bar.addEventListener("mouseenter", () => labels[i].setAttribute("opacity", 1)); // Show text on hover
                bar.addEventListener("mouseleave", () => labels[i].setAttribute("opacity", 0)); // Hide text on mouse out
            });
        }
    });
}

```

<div class="grid grid-cols-1"> 
  <div class="card"> ${resize((width) => EmissionsByCapitalDecade(dataset, { width }))} </div> 
</div>

### CO₂ Emissions Heatmap 🌍

```js
// Prepare the data for heatmap visualization with the top 20 countries by emissions
function prepareHeatmapData(data, yearRange = [2000, 2022]) {
  // Filter data to only include years within the specified range
  const filteredData = data
    .filter(d => d.Year >= yearRange[0] && d.Year <= yearRange[1])
    .map(d => ({
      country: d.Entity,
      year: d.Year,
      emissions: +d["Annual CO₂ emissions (per capita)"]
    }));
  
  // Aggregate emissions per country over the selected years
  const totalEmissionsByCountry = d3.rollup(
    filteredData,
    v => d3.sum(v, d => d.emissions),
    d => d.country
  );

  // Sort countries by total emissions and keep only the top 20
  const topCountries = Array.from(totalEmissionsByCountry)
    .sort((a, b) => b[1] - a[1]) // Sort descending by emissions
    .slice(0, 20)                 // Keep only the top 20 countries
    .map(d => d[0]);              // Extract the country names

  // Filter original data to include only the top 20 countries
  return filteredData.filter(d => topCountries.includes(d.country));
}


// Heatmap visualization function
function EmissionsHeatmap(data, { width = 800 } = {}) {
  // Prepare the data specifically for the heatmap
  const heatmapData = prepareHeatmapData(data);

  return Plot.plot({
    width,      // Set width of plot (default is 800)
    height: 800, // Set height of plot to 600
    marginLeft: 100,   // Add left margin for y-axis labels
    marginBottom: 100, // Add bottom margin for x-axis labels
    style: {
      fontSize: "14px"  // Set global font size (adjust as needed)
    },
    x: {
      label: "Year",  // Label for x-axis
      domain: Array.from(new Set(heatmapData.map(d => d.year))).sort(), // Unique years for x-axis
    },
    y: {
      label: "Country",  // Label for y-axis
      domain: Array.from(new Set(heatmapData.map(d => d.country))), // Unique countries for y-axis
      tickRotate: -45,    // Rotate y-axis tick labels for readability
      tickFontSize: 24,   // Increase font size for country names
    },
    color: {
      type: "linear",  // Linear color scale for emissions values
      domain: [0, d3.max(heatmapData, d => d.emissions)], // Range of colors based on min-max emissions
      scheme: "reds", // Color scheme for emissions intensity (light to dark red)
      label: "CO₂ Emissions (per capita)" // Label for color legend
    },
    marks: [
      // Create a heatmap grid using rectangles for each (country, year) pair
      Plot.rect(heatmapData, { 
        x: "year",         // x-axis represents the year
        y: "country",      // y-axis represents the country
        fill: "emissions", // Fill color intensity based on emissions level
        inset: -1,       // Decrease space between boxes (adjust as needed)
        title: d => `${d.country} (${d.year}): ${d.emissions} tons` // Tooltip text for each cell
      })
    ]
  });
}

// Render the heatmap with the dataset
EmissionsHeatmap(dataset)
```
<div class="grid grid-cols-1"> 
  <div class="card"> ${resize((width) => EmissionsHeatmap(dataset, { width }))} </div> 
</div>

