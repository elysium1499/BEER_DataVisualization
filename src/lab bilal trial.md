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
// Load the new data file
const dataset2 = FileAttachment("data/co2-fossil-plus-land-use.csv").csv({typed: true});
```

```js
// Prepare the data for heatmap visualization with total, fossil, and land-use emissions
function prepareHeatmapData(data, yearRange = [2011, 2022]) {
  // Filter data to only include years within the specified range
  const filteredData = data
    .filter(d => d.Year >= yearRange[0] && d.Year <= yearRange[1])
    .map(d => ({
      country: d.Entity,
      year: d.Year,
      totalEmissions: +d["Annual CO₂ emissions including land-use change"], // Total emissions
      fossilEmissions: +d["Annual CO₂ emissions"],                          // Fossil fuel emissions
      landUseEmissions: +d["Annual CO₂ emissions from land-use change"]     // Land-use emissions
    }));

  // Aggregate total emissions by country to find the top 20 emitters
  const totalEmissionsByCountry = d3.rollup(
    filteredData,
     v => d3.sum(v, d => d.fossilEmissions + d.landUseEmissions),
    d => d.country
  );

  // Get the top 20 countries by total emissions
  const topCountries = Array.from(totalEmissionsByCountry)
    .sort((a, b) => b[1] - a[1]) // Sort by descending total emissions
    .slice(0, 10)                 // Keep only the top 20 countries
    .map(d => d[0]);              // Extract country names

  // Filter to include only the top 20 countries
  return filteredData.filter(d => topCountries.includes(d.country));
}

// Heatmap visualization function for selected emission type
function EmissionsHeatmap(data, type = "totalEmissions", { width = 1000 } = {}) {
  // Prepare the data specifically for the heatmap
  const heatmapData = prepareHeatmapData(data);

  return Plot.plot({
    width,
    height: 500,
    marginLeft: 100,
    marginBottom: 50,
    style: {
      fontSize: "12px" // Set global font size
    },
    x: {
      label: "Year",
      domain: Array.from(new Set(heatmapData.map(d => d.year))).sort(),
    },
    y: {
      label: "Country",
      labelAnchor: "top",
      domain: Array.from(new Set(heatmapData.map(d => d.country))),
      tickRotate: -45,
    },
    color: {
      type: "linear",
      domain: [0, d3.max(heatmapData, d => d[type])], // Set color domain based on selected type
      scheme: "reds",
      label: `CO₂ Emissions (${type})`
    },
    marks: [
      Plot.rect(heatmapData, { 
        x: "year",
        y: "country",
        fill: d => d[type], // Choose the emission type for color intensity
        title: d => `${d.country} (${d.year}): ${d[type]} tons`
      })
    ]
  });
}

// Render the heatmap with total emissions
EmissionsHeatmap(dataset2, "totalEmissions");
```
<div class="grid grid-cols-1"> 
  <div class="card"> ${resize((width) => EmissionsHeatmap(dataset2,"totalEmissions", { width }))} </div> 
</div>



```js
// Prepare the data for the vertically stacked heatmap visualization
function prepareComparisonHeatmapData(data, yearRange = [2011, 2022]) {
  // Filter data within the selected year range
  const filteredData = data
    .filter(d => d.Year >= yearRange[0] && d.Year <= yearRange[1])
    .map(d => ({
      country: d.Entity,
      year: d.Year,
      fossilEmissions: +d["Annual CO₂ emissions"],                         // Fossil fuel emissions
      landUseEmissions: +d["Annual CO₂ emissions from land-use change"]    // Land-use emissions
    }));

  // Aggregate total fossil + land-use emissions by country to find the top 20 emitters
  const totalEmissionsByCountry = d3.rollup(
    filteredData,
    v => d3.sum(v, d => d.fossilEmissions + d.landUseEmissions),
    d => d.country
  );

  // Get the top 20 countries by combined emissions
  const topCountries = Array.from(totalEmissionsByCountry)
    .sort((a, b) => b[1] - a[1])  // Sort descending by total emissions
    .slice(0, 10)                 // Keep only the top 20 countries
    .map(d => d[0]);              // Extract country names

  // Filter original data to include only the top 20 countries
  return filteredData.filter(d => topCountries.includes(d.country));
}

// Comparative Heatmap visualization function for fossil vs land-use emissions
function EmissionsComparisonHeatmap(data, { width = 800 } = {}) {
  // Prepare the data specifically for the heatmap
  const heatmapData = prepareComparisonHeatmapData(data);

  // Map years and emission types for heatmap arrangement with stacking
  const expandedData = [];
  heatmapData.forEach(d => {
    expandedData.push(
      { country: d.country, year: d.year, emissionType: "Fossil Fuel", emissions: d.fossilEmissions },
      { country: d.country, year: d.year, emissionType: "Land-Use", emissions: d.landUseEmissions }
    );
  });

  return Plot.plot({
    width,
    height: 700,
    marginLeft: 100,
    marginBottom: 50,
    style: {
      fontSize: "10px" // Set global font size
    },
    x: {
      label: "Year",
      paddingInner: 0.05,
      domain: Array.from(new Set(expandedData.map(d => d.year))).sort(),
      tickRotate: -45,
    },
    y: {
      label: "Country (Emission Type)",
      labelAnchor: "top",
      paddingInner: 0.05,
      domain: Array.from(new Set(expandedData.map(d => `${d.country} (${d.emissionType})`))), // Stack vertically
    },
    color: {
      type: "linear",
      domain: [0, d3.max(expandedData, d => d.emissions)], // Set color intensity range based on emissions
      scheme: "reds",
      label: "CO₂ Emissions (tons per capita)"
    },
    marks: [
      // Rectangles for fossil and land-use emissions stacked vertically for each year
      Plot.rect(expandedData, { 
        x: "year",
        y: d => `${d.country} (${d.emissionType})`, // Stack by combining country and emissionType
        fill: "emissions", // Set color intensity based on emissions value
        title: d => `${d.country} (${d.year}, ${d.emissionType}): ${d.emissions.toFixed(2)} tons`, // Tooltip
        stroke: "black",
        strokeWidth: 0.1
      })
    ]
  });
}

// Render the comparative heatmap with stacking
EmissionsComparisonHeatmap(dataset2, { width: 800 });

```
<div class="grid grid-cols-1"> 
  <div class="card"> ${resize((width) => EmissionsComparisonHeatmap(dataset2, { width }))} </div> 
</div>



