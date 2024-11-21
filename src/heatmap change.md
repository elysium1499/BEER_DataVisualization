---
theme: dashboard
title: heatmap
toc: true
---


### CO₂ Emissions Heatmap 🌍


```js
const datasetFossil = await FileAttachment("data/co2-fossil-plus-land-use.csv").csv({ typed: true });

// Calculate the global domain for the color scale
const globalMinEmissions = 0; // Assuming CO₂ emissions can't be negative
const globalMaxEmissions = d3.max(datasetFossil, d => +d["Annual CO₂ emissions"]) / 1e9; // Convert to billion tons

// Prepare the data for the heatmap based on the selected year and top countries
function prepareDataForYear(data, year) {
  return data
    .filter(d => d.Year === year)
    .map(d => ({
      country: d.Entity,
      region: d.Region,
      year,
      fossilEmissions: +d["Annual CO₂ emissions from fossil fuel"] / 1e9,       // Normalizing to million tons
      landUseEmissions: +d["Annual CO₂ emissions from land-use change"] / 1e9, // Normalizing to million tons
      totalEmissions: +d["Annual CO₂ emissions"] / 1e9 // Total emissions
    }))
    .sort((a, b) => b.totalEmissions - a.totalEmissions) // Sort by total emissions
    .slice(0, 10) // Top 10 countries by total emissions
    .flatMap(d => [
      { country: d.country, yearAndType: `${year} (Fossil Fuel)`, emissions: d.fossilEmissions },
      { country: d.country, yearAndType: `${year} (Land-Use)`, emissions: d.landUseEmissions },
      { country: d.country, yearAndType: `${year} (Total)`, emissions: d.totalEmissions } // Add total emissions
    ]);
}

// Generate and render the heatmap based on the selected year
function renderHeatmap(data, year) {
  const heatmapData = prepareDataForYear(data, year);
  const heatmap = Plot.plot({
    width: 1000, // Increase width for bigger cells
    height: 300, // Increase height for bigger cells
    marginLeft: 150,
    marginBottom: 100,
    marginTop: 50,
    style: {
      fontSize: "14px", // Keep font size readable
      color: "white"
    },
    x: {
      label: "Country",
      domain: [...new Set(heatmapData.map(d => d.country))],
      tickRotate: -30,
      labelAnchor: "center",
      paddingInner: 0.1 // Adjust spacing between columns for bigger cells
    },
    y: {
      label: "Year and Emission Type",
      domain: [`${year} (Fossil Fuel)`, `${year} (Land-Use)`, `${year} (Total)`],
      paddingInner: 0.1 // Adjust spacing between rows for bigger cells
    },
color: {
      type: "linear",
      domain: [globalMinEmissions, globalMaxEmissions], // Use global domain for fixed legend
      scheme: "reds",
      label: "CO₂ Emissions (billion tons)",
      legend: true
    },
    marks: [
      Plot.rect(heatmapData, { 
        x: "country", 
        y: "yearAndType", 
        fill: "emissions", 
        title: d => `${d.country}: ${d.emissions.toFixed(2)} billion tons`,
        tip: true,
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
let autoPlayInterval;

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
document.getElementById("auto-play-button").onclick = () => toggleAutoPlay(datasetFossil);

// Call the initialize function with the dataset
initializeDropdown(datasetFossil);
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

<p>

The heatmap visually represents the share of CO₂ emissions coming from *fossil fuels* versus *land-use changes* across different countries. In this heatmap, regions where *fossil fuel emissions* dominate are shown with deeper shades of red, indicating a higher contribution to total emissions from industries such as energy production, transportation, and manufacturing. On the other hand, areas where *land-use emissions*, such as deforestation and agriculture, play a larger role are highlighted in shades of green, indicating their significant impact on global CO₂ levels due to land transformation and vegetation loss.

Countries with large industrial economies and high energy consumption, such as the **USA**, **China**, and **India**, dominate the red spectrum. These nations rely heavily on fossil fuels for electricity, heating, transportation, and manufacturing, driving the bulk of their emissions from these sources. **Europe** also shows significant fossil fuel emissions, particularly in industrialized nations like **Germany** and **Russia**.
  
Countries with significant land-use emissions are those with large agricultural sectors or high rates of deforestation. **Brazil** stands out in South America, where deforestation of the Amazon contributes massively to carbon emissions. Similarly, **Indonesia** also shows strong land-use emissions. These emissions primarily result from agricultural practices, land clearing for agriculture, and changes in forest cover.

This heatmap reveals a global landscape where **fossil fuel consumption** is the dominant source of emissions in highly industrialized countries, whereas **land-use changes** emerge as a major source in regions with extensive agricultural practices or deforestation. Understanding the distribution of these emission types is crucial for shaping climate policies, as addressing fossil fuel emissions may require different strategies than tackling emissions from land-use changes.
</p>


