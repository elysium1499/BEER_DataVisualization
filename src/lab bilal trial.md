---
theme: dashboard
title: Bilal Trial
toc: false
---
### CO₂ Emissions Heatmap 🌍

```js
// Load the new data file
const dataset2 = FileAttachment("data/co2-fossil-plus-land-use.csv").csv({typed: true});
```


```js
// Prepare the data for the heatmap based on the selected year and top countries
function prepareDataForYear(data, year) {
  return data
    .filter(d => d.Year === year)
    .map(d => ({
      country: d.Entity,
      year,
      fossilEmissions: +d["Annual CO₂ emissions"],
      landUseEmissions: +d["Annual CO₂ emissions from land-use change"]
    }))
    .sort((a, b) => (b.fossilEmissions + b.landUseEmissions) - (a.fossilEmissions + a.landUseEmissions))
    .slice(0, 10) // Top 10 countries by total emissions
    .flatMap(d => [
      { country: d.country, yearAndType: `${year} (Fossil Fuel)`, emissions: d.fossilEmissions },
      { country: d.country, yearAndType: `${year} (Land-Use)`, emissions: d.landUseEmissions }
    ]);
}

// Generate and render the heatmap based on the selected year
function renderHeatmap(data, year) {
  const heatmapData = prepareDataForYear(data, year);
  const heatmap = Plot.plot({
    width: 800,
    height: 200,
    marginLeft: 150,
    marginBottom: 100,
        style: {
      fontSize: "14px",      // Set global font size for all text elements (axis labels, ticks, legend)
      color: "black"         // Set text color globally for better visibility
    },
    x: {
      label: "Country",
      domain: [...new Set(heatmapData.map(d => d.country))],
      tickRotate: -30,
      labelAnchor: "left",
      paddingInner: 0.05
    },
    y: {
      label: "Year and Emission Type",
      domain: [`${year} (Fossil Fuel)`, `${year} (Land-Use)`],
      paddingInner: 0.05
    },
    color: {
      type: "linear",
      domain: [0, d3.max(heatmapData, d => d.emissions)],
      scheme: "reds",
      label: "CO₂ Emissions (tons per capita)",
    },
    marks: [
      Plot.rect(heatmapData, { 
        x: "country", 
        y: "yearAndType", 
        fill: "emissions", 
        title: d => `${d.country} (${d.yearAndType}): ${d.emissions.toFixed(2)} tons`,
        stroke: "black",
        strokeWidth: 0.1
      })
    ]
  });
  document.getElementById("heatmap-container").innerHTML = ""; // Clear previous plot
  document.getElementById("heatmap-container").appendChild(heatmap); // Append new plot
}

// Initialize the dropdown menu and initial heatmap
function initializeDropdown(data) {
  const years = [...new Set(data.map(d => d.Year))].sort((a, b) => a - b);
  const dropdown = document.getElementById("year-dropdown");
  dropdown.onchange = () => renderHeatmap(data, Number(dropdown.value));

  years.forEach(year => {
    const option = document.createElement("option");
    option.value = year;
    option.text = year;
    dropdown.appendChild(option);
  });

  renderHeatmap(data, years[0]); // Render the heatmap for the initial year
}

// Auto-play functionality to cycle through years
let autoPlayInterval; // Variable to store the interval for auto-play

function toggleAutoPlay(data) {
  const dropdown = document.getElementById("year-dropdown");
  const years = [...dropdown.options].map(option => Number(option.value));
  let currentIndex = years.indexOf(Number(dropdown.value));

  if (autoPlayInterval) {
    // Stop auto-play if it's already running
    clearInterval(autoPlayInterval);
    autoPlayInterval = null;
    document.getElementById("auto-play-button").innerText = "Auto Play";
  } else {
    // Start auto-play
    autoPlayInterval = setInterval(() => {
      // Check if the next year is greater than the current year
      const previousYear = years[currentIndex];
      currentIndex = (currentIndex + 1) % years.length;
      const currentYear = years[currentIndex];

      if (currentYear <= previousYear) {
        // Stop auto-play if the year does not increase
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
        document.getElementById("auto-play-button").innerText = "Auto Play";
      } else {
        // Update dropdown and heatmap with the new year
        dropdown.value = currentYear;
        renderHeatmap(data, currentYear);
      }
    }, 350); // Change year every 1 second
    document.getElementById("auto-play-button").innerText = "Stop";
  }
}

// Attach the toggleAutoPlay function to the button
document.getElementById("auto-play-button").onclick = () => toggleAutoPlay(dataset2);

// Call the initialize function with the dataset
initializeDropdown(dataset2);
```

<div class="grid grid-cols-1"> 
  <div class="card">
    <div id="dropdown-container" style="display: flex; justify-content: center; align-items: center; gap: 10px; margin-bottom: 10px;">
      <span>Select a year to view CO₂ emissions by country:</span> 
      <select id="year-dropdown"></select> <!-- Dropdown for years -->
      <button id="auto-play-button">Auto Play</button> <!-- Auto Play button -->
    </div>
    <div id="heatmap-container"></div>
  </div> 
</div>



