---
theme: dashboard
title: Laboratory One
toc: false
---

<!-- Load the data -->

```js
//column: Entity,Code,Year,Annual CO₂ emissions (per capita)
const dataset = FileAttachment("data/co-emissions-per-capita-filter.csv").csv({typed: true});
//column: Entity,Region
const RegionDataset = FileAttachment("data/region_entities.csv").csv({typed: true});
//column: Entity,Region,Population
const populationDataset = FileAttachment("data/region_entities_population2022.csv").csv({typed: true});
//column: Entity,Code,Year,Annual CO₂ emissions including land-use change,Annual CO₂ emissions from land-use change,Annual CO₂ emissions
const dataset2 = FileAttachment("data/co2-fossil-plus-land-use.csv").csv({typed: true});

```

<!-- BarPlot that show the emission and the country in one year -->

# Section 1

<br>

### First Part

<br>

##### Top 20 Countries with high CO₂ Emissions Per Capita in the Years 🌍

```js

const uniqueEntities = [...new Set(dataset.map(d => d.Year.toString()))].sort((a, b) => b - a);
const year = view(Inputs.select(uniqueEntities, {label: "📅 Choose Year"}));


function EmissionsByCapitalYear(data, year, { width = 800 } = {}) {
  const filteredData = data
    .filter(d => d.Year.toString() === year)
    .map(d => ({
      city: d.Entity,
      co2Emissions: +d["Annual CO₂ emissions (per capita)"]
    }))
    .sort((a, b) => b.co2Emissions - a.co2Emissions)
    .slice(0, 20);

    const colorPalette = [
        "#FFDFBA", // Light Apricot
        "#FFD700", // Gold
        "#FF8C00", // Dark Orange
        "#FF4500", // Orange Red
        "#6B8E23", // Olive Drab
        "#3CB371", // Medium Sea Green
        "#2E8B57", // Sea Green
        "#20B2AA", // Light Sea Green
        "#4682B4", // Steel Blue
        "#4169E1", // Royal Blue
        "#6A5ACD", // Slate Blue
        "#8A2BE2", // Blue Violet
        "#7B68EE", // Medium Slate Blue
        "#A0522D", // Sienna
        "#D2691E", // Chocolate
        "#B22222", // Firebrick
        "#696969", // Dim Gray
        "#A9A9A9", // Dark Gray
    ];

    const coloredData = filteredData.map((cityData, index) => ({
        ...cityData,
        color: colorPalette[index % colorPalette.length]
    }));

    return Plot.plot({
        height: 400,
        width,
        marginLeft: 60,
        marginBottom: 130,
        x: {
            label: "Country",
            domain: coloredData.map(d => d.city),
            tickRotate: -45,
            tickSize: 10 
        },
        y: {
            label: "Annual CO₂ Emissions (per capita) - Billion tons",
            grid: true
        },
        marks: [
            Plot.barY(coloredData, { 
                x: "city", 
                y: "co2Emissions", 
                fill: "color"
            })
        ]
    });
}

```
<div class="grid grid-cols-1"> 
  <div class="card"> ${resize((width) => EmissionsByCapitalYear(dataset, year, {width}))} </div> 
</div>




<!-- BarPlot that show the emission and the country in one decade (2011 to 2022) -->
<br>

##### Top 20 Countries with high CO₂ Emissions Per Capita in nearest decade (2011 to 2022) 🌍

```js
function EmissionsByCapital(data, { width = 800 } = {}) {
    const totalEmissions = data
        .filter(d => d.Year >= 2011 && d.Year <= 2022)
        .reduce((acc, d) => {
            const city = d.Entity;
            const emissions = +d["Annual CO₂ emissions (per capita)"];

            if (!acc[city]) {
                acc[city] = { city, co2Emissions: 0 };
            }
            acc[city].co2Emissions += emissions;
            return acc;
        }, {});

    const topCities = Object.values(totalEmissions)
        .sort((a, b) => b.co2Emissions - a.co2Emissions)
        .slice(0, 20);

    const uniqueEmissions = [...new Set(topCities.map(d => d.co2Emissions))];

    const colorPalette = [
        "#FFE5B4", // Light Apricot
        "#FFD700", // Gold
        "#FF8C00", // Dark Orange
        "#FF4500", // Orange Red
        "#6B8E23", // Olive Drab
        "#3CB371", // Medium Sea Green
        "#2E8B57", // Sea Green
        "#20B2AA", // Light Sea Green
        "#4682B4", // Steel Blue
        "#4169E1", // Royal Blue
        "#6A5ACD", // Slate Blue
        "#8A2BE2", // Blue Violet
        "#7B68EE", // Medium Slate Blue
        "#A0522D", // Sienna
        "#D2691E", // Chocolate
        "#B22222", // Firebrick
        "#696969", // Dim Gray
        "#A9A9A9", // Dark Gray
    ];

    const emissionColorMap = {};
    uniqueEmissions.forEach((emission, index) => {
        emissionColorMap[emission] = colorPalette[index % colorPalette.length];
    });

    const coloredCities = topCities.map(cityData => ({
        ...cityData,
        color: emissionColorMap[cityData.co2Emissions]
    }));

    return Plot.plot({
        height: 400,
        width,
        marginLeft: 150,
        marginBottom: 60,
        x: {
            label: "Total CO₂ Emissions (per capita) - Billion Tons",
            grid: true,
            nice: true
        },
        y: {
            label: "Country",
            labelPosition: "top",
            domain: coloredCities.map(d => d.city),
            tickRotate: 0
        },
        marks: [
            Plot.barX(coloredCities, { 
                x: "co2Emissions", 
                y: "city", 
                fill: "color"
            })
        ]
    });
}

```

<div class="grid grid-cols-1"> 
  <div class="card"> ${resize((width) => EmissionsByCapital(dataset, {width}))} </div> 
</div>

<br>
<br>

### Second Part

<br>

##### Region with high CO₂ Emissions 🌍

```js
function prepareStackedData(data, regionsData) {
  const mergedData = data.filter(d => d.Year === 2022).map(d => {
    const regionData = regionsData.find(region => region.Entity === d.Entity);
    const populationData = populationDataset.find(pop => pop.Entity === d.Entity);
    return {
      city: d.Entity,
      co2Emissions: +d["Annual CO₂ emissions (per capita)"]* (populationData.Population2022)/ 1_000_000_000,
      region: regionData ? regionData.Region : "Unknown"
    };
  });

  return mergedData;
}

function EmissionsByRegionStacked(data, regionsData, { width = 800 } = {}) {
  const preparedData = prepareStackedData(data, regionsData);
  const totalEmissionsByEntity = preparedData.reduce((acc, d) => {
  if (!acc[d.city]) {
    acc[d.city] = { co2Emissions: 0, region: d.region };
  }
    acc[d.city].co2Emissions += d.co2Emissions;
    return acc;
  }, {});

const topCities = Object.values(
  Object.entries(totalEmissionsByEntity)
    .reduce((acc, [city, { co2Emissions, region }]) => {
      if (!acc[region]) acc[region] = [];
      acc[region].push({ city, co2Emissions, region });
      return acc;
    }, {})
).map(citiesInRegion => {
    const sortedCities = citiesInRegion.sort((a, b) => b.co2Emissions - a.co2Emissions);
    const top5Cities = sortedCities.slice(0, 5);
    const otherCitiesSum = sortedCities.slice(5).reduce((sum, city) => sum + city.co2Emissions, 0);
    return [...top5Cities, { city: 'Other Countries', co2Emissions: otherCitiesSum, region: top5Cities[0].region }];
  }).flat();

  const colorPalette = ["#CC564D", "#D4AC40", "#800080", "#4FAAC4", "#008000"];

  const cityColorMap = {};
  topCities.forEach(d => {
    if (d.city === "Other Countries") {
      cityColorMap[d.city] = "#00008B";
    } else {
      const cityIndex = topCities.filter(c => c.region === d.region).indexOf(d);
      cityColorMap[d.city] = colorPalette[cityIndex];
    }
  });

  const regionData = {};

  topCities.forEach(d => {
    if (!regionData[d.region]) {
      regionData[d.region] = {
        region: d.region,
        co2Emissions: 0,
        cities: []
      };
    }
    regionData[d.region].co2Emissions += d.co2Emissions;

    if (!regionData[d.region].cities.some(city => city.city === d.city)) {
      regionData[d.region].cities.push({
        city: d.city,
        co2Emissions: d.co2Emissions,
        color: cityColorMap[d.city]
      });
    }
  });

  const finalData = Object.values(regionData).sort((a, b) => b.co2Emissions - a.co2Emissions);

  return Plot.plot({
    width,
    height: 500,
    marginLeft: 100,
    marginBottom: 60,
    x: {
      label: "Total Annual CO₂ Emissions (per capita) - Billion Tons",
      grid: true,
      tickSpacing: 50,
      tickFormat: d => `${d} BT`
    },
    y: {
      label: "Region",
      domain: finalData.map(d => d.region),
      labelPosition: "top"
    },
    marks: [
      Plot.barX(topCities, {
        x: "co2Emissions",
        y: d => d.region,
        fill: d => cityColorMap[d.city],
        title: d => `${d.city}: ${d.co2Emissions.toFixed(4)} Billion Tons of CO₂`,
        tip: true
      })
    ]
  });

}

```
<div class="grid grid-cols-1">
  <div class="card"> ${resize((width) => EmissionsByRegionStacked(dataset, RegionDataset, { width }))} </div>
</div>

<br>
<br>

##### Top 3 CO₂ emitters per capita per region - Stacked small multiple🌍


<!--Lazzarini Part-->

```js
const colorPalette = ["#CC564D", "#D4AC40", "#800080", "#00008B", "#A0522D"];

// Step 1: Data Preparation
function prepareData(data, regionsData) {
    return data.map(d => {
        const regionData = regionsData.find(region => region.Entity === d.Entity);
        const populationData = populationDataset.find(pop => pop.Entity === d.Entity);
        return {
            city: d.Entity,
            co2Emissions: +d["Annual CO₂ emissions (per capita)"] * (populationData.Population2022)/ 1_000_000_000,
            region: regionData ? regionData.Region : "Unknown"
        };
    });
}


// Step 2: Calculate total CO₂ emissions for each city within a region
function calculateRegionalEmissions(preparedData) {
    return preparedData.reduce((acc, record) => {
        const { region, city, co2Emissions } = record;

        if (!acc[region]) {
            acc[region] = {};
        }
        if (!acc[region][city]) {
            acc[region][city] = 0;
        }
        acc[region][city] += co2Emissions;
        return acc;
    }, {});
}

function selectTopCities(totalEmissionsByRegion, topN = 3) {
    let topCitiesByRegion = {};

    // Step 1: Build top cities for each region
    for (const region in totalEmissionsByRegion) {
        const sortedCities = Object.entries(totalEmissionsByRegion[region])
            .map(([city, co2Emissions]) => ({ city, co2Emissions, region }))
            .filter(cityData => cityData.co2Emissions > 0)
            .sort((a, b) => b.co2Emissions - a.co2Emissions);

        // Keep only the top 3 emitters
        topCitiesByRegion[region] = sortedCities.slice(0, topN);

        // Calculate and include total emissions
        const totalEmissions = sortedCities.reduce((sum, city) => sum + city.co2Emissions, 0);
        topCitiesByRegion[region].push({ city: "Total", co2Emissions: totalEmissions, region });
    }

    // Step 2: Sort regions by total emissions in descending order
    const sortedRegions = Object.entries(topCitiesByRegion)
        .map(([region, cities]) => {
            const totalEmissions = cities.reduce((sum, city) => sum + city.co2Emissions, 0);
            return { region, cities, totalEmissions };
        })
        .sort((a, b) => b.totalEmissions - a.totalEmissions);

    // Step 3: Rebuild topCitiesByRegion in sorted order
    topCitiesByRegion = Object.fromEntries(sortedRegions.map(({ region, cities }) => [region, cities]));

    return topCitiesByRegion;
}




// Step 4: Rank emitters by position across regions
function rankEmittersByPosition(topCitiesByRegion) {
    const rankedEmitters = [];
    const maxLength = Math.max(...Object.values(topCitiesByRegion).map(region => region.length));

    for (let position = 0; position < maxLength; position++) {
        const emittersAtPosition = {};

        for (const region in topCitiesByRegion) {
            const cityData = topCitiesByRegion[region][position];
            if (cityData) {
                if (!emittersAtPosition[region]) {
                    emittersAtPosition[region] = [];
                }
                emittersAtPosition[region].push(cityData);
            }
        }

        rankedEmitters.push(emittersAtPosition);
    }

    return rankedEmitters;
}

// Step 5: Generate mini-datasets based on ranked emitters for subplots
function generateMiniDatasets(topCitiesByRegion) {
    const rankedEmitters = rankEmittersByPosition(topCitiesByRegion);
    return rankedEmitters.map((emitters, index) => ({
        rank: index + 1,
        data: emitters
    }));
}

// Step 6: Apply a unique color to each dataset
function applyColorPaletteMiniDatasets(miniDatasets, colorPalette) {
    miniDatasets.forEach((dataset, index) => {
        dataset.color = colorPalette[index % colorPalette.length];
    });
}

// Step 7: Create a single subplot for a mini-dataset with optional text labels and centered x-axis label
function createSubplot(data, orderedRegions, label, width, height, showYAxisLabels, color, showText = true) {
    return Plot.plot({
        width,
        height,
        marginLeft: showYAxisLabels ? 100 : 20,
        marginBottom: 80,
        x: {
            label,
            labelAnchor: "center",
            grid: true,
            tickFormat: "s",
            tickSpacing: 50,
            tickFormat: d => `${d} BT`
        },
        y: {
            domain: orderedRegions,
            label: showYAxisLabels ? "Region" : null,
            labelPosition: "top",
            ticks: showYAxisLabels ? orderedRegions : [],
        },
        marks: [
            Plot.barX(data, {
                x: "co2Emissions",
                y: "region",
                fill: color,
                title: d => `${d.city}: ${d.co2Emissions.toFixed(2)} Billion Tons of CO₂`,
                tip: true
            }),
        ]
    });
}



// Dynamically generate labels based on `topNPerRegion`
function generateLabels(topNPerRegion) {
    const rankLabels = ["First", "Second", "Third"];
    const labels = rankLabels.slice(0, topNPerRegion);
    labels.push("Total emissions");
    return labels;
}

// Step 8: Create container with subplots, applying a unique color for each subplot
function createSubplotContainer(miniDatasets, orderedRegions, width, height, topNPerRegion) {
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.gap = "20px";

    // Generate appropriate labels
    const labels = generateLabels(topNPerRegion);

    miniDatasets.forEach((dataset, index) => {
        const subplotWidth = index === miniDatasets.length - 1 ? (width / miniDatasets.length) * 2 : width / miniDatasets.length;
        const data = orderedRegions.flatMap(region => dataset.data[region] || []);
        
        const label = labels[index];
        const showYAxisLabels = index === 0;
        const showText = index < miniDatasets.length - 2;
        const subplot = createSubplot(data, orderedRegions, label, subplotWidth, height, showYAxisLabels, dataset.color, showText);
        
        const subplotContainer = document.createElement("div");
        subplotContainer.appendChild(subplot);
        container.appendChild(subplotContainer);
    });

    return container;
}


// Main function to create the full visualization with modularized steps
function EmissionsByRegionStackedMultiple(data, regionsData, { width = 1600, height = 500, topNPerRegion } = {}) {
    // Step 1-3: Data preparation and processing
    const preparedData = prepareData(data, regionsData);
    const regionalEmissions = calculateRegionalEmissions(preparedData);
    const topCitiesByRegion = selectTopCities(regionalEmissions, topNPerRegion, true, true);

    // Step 4-5: Generate mini-datasets based on rankings
    const miniDatasets = generateMiniDatasets(topCitiesByRegion);
    
    // Define orderedRegions after miniDatasets are generated
    const orderedRegions = Object.keys(miniDatasets[miniDatasets.length - 1].data)
        .sort((a, b) => miniDatasets[miniDatasets.length - 1].data[b][0].co2Emissions - miniDatasets[miniDatasets.length - 1].data[a][0].co2Emissions);

    // Step 6: Apply a unique color to each mini-dataset
    applyColorPaletteMiniDatasets(miniDatasets, colorPalette);

    // Step 7-8: Create and return container with subplots
    return createSubplotContainer(miniDatasets, orderedRegions, width, height, topNPerRegion);
}
```
<div class="grid grid-cols-1">
  <div class="card">${resize(width => EmissionsByRegionStackedMultiple(dataset, RegionDataset, { width, topNPerRegion: 3 }))}</div>
</div>

<br>
<br>

<!-- Percentage of first graph rappresentation-->

##### Region with high CO₂ Percentage Emissions 🌍

```js

function EmissionsByRegionStackedPercentage(data, regionsData, { width = 800 } = {}) {
  const preparedData = prepareStackedData(data, regionsData);
  
  const totalEmissionsByEntity = preparedData.reduce((acc, d) => {
    if (!acc[d.city]) {
      acc[d.city] = { co2Emissions: 0, region: d.region };
    }
    acc[d.city].co2Emissions += d.co2Emissions;
    return acc;
  }, {});

  const totalEmissionsByRegion = Object.values(totalEmissionsByEntity).reduce((acc, { co2Emissions, region }) => {
    acc[region] = (acc[region] || 0) + co2Emissions;
    return acc;
  }, {});

  const topCities = Object.values(
    Object.entries(totalEmissionsByEntity)
      .reduce((acc, [city, { co2Emissions, region }]) => {
        if (!acc[region]) acc[region] = [];
        acc[region].push({ city, co2Emissions, region });
        return acc;
      }, {})
  ).map(citiesInRegion => {
      const sortedCities = citiesInRegion.sort((a, b) => b.co2Emissions - a.co2Emissions);
      const top5Cities = sortedCities.slice(0, 5);
      const otherCitiesSum = sortedCities.slice(5).reduce((sum, city) => sum + city.co2Emissions, 0);
      return [
        ...top5Cities, 
        { city: 'Other Cities', co2Emissions: otherCitiesSum, region: top5Cities[0].region }
      ];
    }).flat();

  const colorPalette = ["#CC564D", "#D4AC40", "#800080", "#4FAAC4", "#008000"];

  const cityColorMap = {};
  topCities.forEach(d => {
    if (d.city === "Other Cities") {
      cityColorMap[d.city] = "#00008B";
    } else {
      const cityIndex = topCities.filter(c => c.region === d.region).indexOf(d);
      cityColorMap[d.city] = colorPalette[cityIndex];
    }
  });

  const topCitiesWithPercentage = topCities.map(d => ({
    ...d,
    co2EmissionsPercentage: (d.co2Emissions / totalEmissionsByRegion[d.region]) * 100
  }));

  const regionData = {};

  topCitiesWithPercentage.forEach(d => {
    if (!regionData[d.region]) {
      regionData[d.region] = {
        region: d.region,
        co2Emissions: 0,
        cities: []
      };
    }
    regionData[d.region].co2Emissions += d.co2Emissions;

    if (!regionData[d.region].cities.some(city => city.city === d.city)) {
      regionData[d.region].cities.push({
        city: d.city,
        co2EmissionsPercentage: d.co2EmissionsPercentage,
        color: cityColorMap[d.city]
      });
    }
  });

  const finalData = Object.values(regionData).sort((a, b) => b.co2Emissions - a.co2Emissions);

  return Plot.plot({
    width,
    height: 500,
    marginLeft: 100,
    marginBottom: 60,
    x: {
        label: "Percentage of Total Regional CO₂ Emissions",
        tickSpacing: 50,
        tickFormat: d => `${d}%`
    },
    y: {
      label: "Region",
      domain: finalData.map(d => d.region),
      labelPosition: "top"
    },
    marks: [
      Plot.barX(topCitiesWithPercentage, {
        x: "co2EmissionsPercentage",
        y: d => d.region,
        fill: d => cityColorMap[d.city],
        title: d => `${d.city}: ${d.co2EmissionsPercentage.toFixed(2)}% emissions`,
        tip: true
      })
    ]
  });
}


```
<div class="grid grid-cols-1">
  <div class="card"> ${resize((width) => EmissionsByRegionStackedPercentage(dataset, RegionDataset, { width }))} </div>
</div>

<br>

### Third part

<br>

<!--Bilal Part-->

##### CO₂ Emissions Heatmap 🌍


```js
// Prepare the data for the heatmap based on the selected year and top countries
function prepareDataForYear(data, year) {
  return data
    .filter(d => d.Year === year)
    .map(d => ({
      country: d.Entity,
      year,
      fossilEmissions: +d["Annual CO₂ emissions"] / 1e9,       // Normalizing to million tons
      landUseEmissions: +d["Annual CO₂ emissions from land-use change"] / 1e9, // Normalizing to million tons
      totalEmissions: (+d["Annual CO₂ emissions"] + +d["Annual CO₂ emissions from land-use change"]) / 1e9 // Total emissions
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
      labelAnchor: "left",
      paddingInner: 0.1 // Adjust spacing between columns for bigger cells
    },
    y: {
      label: "Year and Emission Type",
      domain: [`${year} (Fossil Fuel)`, `${year} (Land-Use)`, `${year} (Total)`],
      paddingInner: 0.1 // Adjust spacing between rows for bigger cells
    },
    color: {
      type: "linear",
      domain: [0, d3.max(heatmapData, d => d.emissions)],
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

