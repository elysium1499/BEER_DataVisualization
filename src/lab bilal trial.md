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
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

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
