---
theme: dashboard
title: Comparing countries
toc: true
---

<!-- Load the data -->

```js
//column: Entity,Code,Year,Annual CO₂ emissions (per capita)
const dataset = FileAttachment("data/co-emissions-per-capita-filter.csv").csv({typed: true});
//column: Entity,Region
const RegionDataset = FileAttachment("data/region_entities.csv").csv({typed: true});
//column: Entity,Region,Population
const populationDataset = FileAttachment("data/region_entities_population2022.csv").csv({typed: true});
//column: Entity,Region,Code,Year,Annual CO₂ emissions,Annual CO₂ emissions from land-use change,Annual CO₂ emissions from fossil fuel
const datasetFossil = await FileAttachment("data/co2-fossil-plus-land-use.csv").csv({ typed: true });

```

<!-- BarPlot that show the emission and the country in one year -->

# CO₂ emissions

<br>

## Exploring data

<br>

### Top 20 Countries with high CO₂ Emissions Per Capita in the Years 🌍

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
    "#90EE90", // Light Green
    "#8B008B"  // Dark Magenta
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

<p> 

Countries like **Qatar**, **United Arab Emirates (UAE)**, and **Kuwait** lead with exceptionally high emissions per capita, primarily due to their reliance on fossil fuel extraction and export.

**Australia**, **United States**, and **Canada** follow closely, with emissions shaped by their high energy consumption, large geographical areas, and industrial economies. 

Despite their small populations, **Trinidad and Tobago** and **New Caledonia** also have high emissions, primarily from fossil fuel use for energy and transport. **Kazakhstan** and **Russia** show lower emissions than the Gulf states and Western nations, but still exceed the global average. Meanwhile, **Luxembourg** maintains high emissions due to its industrial economy, while **Palau** stands out with lower emissions, thanks to its focus on tourism over heavy industry.
</p>

<!-- BarPlot that show the emission and the country in one decade (2011 to 2022) -->
<br>

### Top 20 Countries with high CO₂ Emissions Per Capita in nearest decade (2011 to 2022) 🌍

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

<p>

From 2011 to 2022, countries like **Qatar**, **Bahrain**, and **Kuwait** consistently ranked at the top for CO₂ emissions per capita, largely due to their heavy reliance on fossil fuel extraction and small, energy-intensive economies.

**Australia**, **United States**, and **Canada** follow closely, with emissions driven by large industrial sectors and energy needs for vast geographical areas. While these countries are larger and more industrialized, their high consumption patterns still make their per capita emissions relatively high compared to global averages.

Meanwhile, **Luxembourg** and **Faroe Islands** stand out for their relatively high per capita emissions despite their small sizes.

In contrast, **Palau** shows a much lower carbon footprint. Its small population and tourism-based economy, which doesn’t rely on heavy industry, allow it to maintain one of the lowest per capita emissions on the list.

Overall, the data highlights a clear link between fossil fuel reliance, industrial activity, and high CO₂ emissions, while also showing how small nations with less industrialization can maintain lower per capita emissions.
</p>

<br>

## Country Comparison per Region in 2022

<br>

### Region with high CO₂ Emissions 🌍

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
      cityColorMap[d.city] = "#303080";
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


<p>

In 2022, global CO₂ emissions were dominated by key countries across regions.
**China** remains the world’s largest emitter, largely due to its vast manufacturing sector, reliance on coal, and the energy demands of its massive population. **India**, while having a lower per capita emission than China, continues to see rapid industrial growth and energy consumption, particularly in urban areas.

In North America, **the USA** continues to be a major emitter with emissions largely driven by energy consumption, transportation, and industrial sectors. **Canada**, with its vast landmass and reliance on energy-intensive industries like oil extraction, also ranks high in emissions per capita.

**Russia** stands as Europe’s largest emitter, with emissions driven by its oil and natural gas extraction industries. **Germany**, Europe’s industrial powerhouse, also contributes heavily, particularly through manufacturing, transportation, and energy sectors.

**South Africa** and **Egypt** are the top emitters in Africa. **South Africa’s** emissions are largely from coal-powered energy production, while **Egypt** has seen increasing emissions due to urbanization and energy demands.

In South America, **Brazil**’s emissions are shaped by deforestation, agriculture, and energy consumption, while **Argentina** also experiences high emissions due to its industrial sector and large-scale agriculture.

**Australia** and **New Zealand** contribute heavily to emissions in Oceania, with **Australia**'s reliance on coal for energy and high per capita car usage. **New Zealand**, despite having a smaller population, has significant emissions from agriculture, particularly livestock.

</p>
<br>

### Top 3 CO₂ emitters per capita per region 🌍


```js
const colorPalette = ["#CC564D", "#D4AC40", "#800080", "#6B8E23"];

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

function selectTopCities(totalEmissionsByRegion, topN, includeOther = false, includeTotal = false) {
    let topCitiesByRegion = {};

    // Step 1: Build top cities for each region
    for (const region in totalEmissionsByRegion) {
       
        const sortedCities = Object.entries(totalEmissionsByRegion[region])
            .map(([city, co2Emissions]) => ({ city, co2Emissions, region }))
            .filter(cityData => cityData.co2Emissions > 0)
            .sort((a, b) => b.co2Emissions - a.co2Emissions);

        topCitiesByRegion[region] = sortedCities.slice(0, topN);

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

<p>

In the previous chart we can visualize the top three CO₂ emitters from each region in 2022, highlighting key trends in energy consumption and industrialization. 

In the top emitters per region, the **USA** stands out as the largest emitter globally, with its massive industrial base, transportation sector, and high energy consumption. Following closely, **India** and **Germany** are the second largest emitters in their respective regions, driven by industrial activities and energy demands. **Japan** and the **UK** round out the third positions, reflecting their energy-intensive economies and reliance on fossil fuels, though Japan's emissions remain high due to its significant manufacturing sector.

This analysis suggests that **Asia** and **Europe** are the regions with the largest concentrations of emissions, with major contributors like the **USA**, **India**, and **Germany** leading the way. Their high emissions stem from a mix of industrialization, transportation, and energy production needs, showing a clear pattern where both population size and industrial output play crucial roles in regional CO₂ emissions.
</p>

<br>

<!-- Percentage of first graph rappresentation-->

### Region with high CO₂ Percentage Emissions 🌍

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
        { city: 'Other Countries', co2Emissions: otherCitiesSum, region: top5Cities[0].region }
      ];
    }).flat();

  const colorPalette = ["#CC564D", "#D4AC40", "#800080", "#4FAAC4", "#008000"];

  const cityColorMap = {};
  topCities.forEach(d => {
    if (d.city === "Other Countries") {
      cityColorMap[d.city] = "#303080";
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

<p>

In Asia, **China** is responsible for 52.18% of the region's CO₂ emissions, highlighting its role as the largest emitter in the world. In **North America**, the **USA** accounts for a staggering 80.27% of emissions, driven by its high energy consumption, transportation sector, and industrial activities. In **Europe**, **Russia** contributes 32.57% of emissions, with **Germany** following at 13.26%, reflecting their large industrial bases and energy needs. 

In **Africa**, **South Africa** is the leading emitter with 29.19%, while **Egypt** contributes 17.45%. **Brazil** accounts for 44.39% of **South America's** emissions, with **Argentina** contributing 17.96%. In **Oceania**, **Australia** dominates, responsible for 89.06% of the region's emissions.

</p>

<br>

## CO₂ emissions comparison per type (fossil/land-use) 

<br>

### CO₂ Emissions Heatmap 🌍


```js
// Prepare the data for the heatmap based on the selected year and top countries
const globalMinEmissions = 0; // Assuming CO₂ emissions can't be negative
const globalMaxEmissions = d3.max(datasetFossil, d => +d["Annual CO₂ emissions"]) / 1e9;

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

