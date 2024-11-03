---
theme: dashboard
title: Laboratory Lazzarini
toc: false
---

<!-- Load and transform the data -->
```js
//column: Entity,Code,Year,Annual CO₂ emissions (per capita)
const dataset = FileAttachment("data/co-emissions-per-capita.csv").csv({typed: true});
//column: Entity,Region
const RegionDataset = FileAttachment("data/region_entities.csv").csv({typed: true});
```

<!--Functions -->
```js
// Step 1: Data Preparation
function prepareData(data, regionsData) {
    return data.map(d => {
        const regionData = regionsData.find(region => region.Entity === d.Entity);
        return {
            city: d.Entity,
            co2Emissions: +d["Annual CO₂ emissions (per capita)"],
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

// Step 3: Select top N cities with optional 'Other' and 'Total' categories
function selectTopCities(totalEmissionsByRegion, topN, includeOther = false, includeTotal = false) {
    const topCitiesByRegion = {};

    for (const region in totalEmissionsByRegion) {
        const sortedCities = Object.entries(totalEmissionsByRegion[region])
            .map(([city, co2Emissions]) => ({ city, co2Emissions, region }))
            .sort((a, b) => b.co2Emissions - a.co2Emissions);

        topCitiesByRegion[region] = sortedCities.slice(0, topN);

        if (includeOther && sortedCities.length > topN) {
            const otherEmissions = sortedCities.slice(topN).reduce((sum, city) => sum + city.co2Emissions, 0);
            topCitiesByRegion[region].push({ city: "Other", co2Emissions: otherEmissions, region });
        }

        if (includeTotal) {
            const totalEmissions = sortedCities.reduce((sum, city) => sum + city.co2Emissions, 0);
            topCitiesByRegion[region].push({ city: "Total", co2Emissions: totalEmissions, region });
        }
    }

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

// Step 6: Apply colors to each dataset
function applyColorPalette(miniDatasets, orderedRegions, colorPalette) {
    miniDatasets.forEach(dataset => {
        orderedRegions.forEach((region, regionIndex) => {
            if (dataset.data[region]) {
                dataset.data[region].forEach(cityData => {
                    cityData.color = colorPalette[regionIndex % colorPalette.length];
                });
            }
        });
    });
}

// Step 7: Create a single subplot for a mini-dataset
function createSubplot(data, orderedRegions, label, width, height, showYAxisLabels) {
    return Plot.plot({
        width,
        height,
        marginLeft: showYAxisLabels ? 60 : 20,
        marginBottom: 80,
        x: {
            label,
            grid: true,
            tickFormat: "s",
            tickSpacing: 50
        },
        y: {
            domain: orderedRegions,
            label: showYAxisLabels ? "Region" : null, // Only show y-axis label on the leftmost plot
            labelPosition: "top",
            ticks: showYAxisLabels ? orderedRegions : [], // Only show y-axis ticks on the leftmost plot
            tickFormat: showYAxisLabels ? d => d : null // Only format y-axis tick labels on the leftmost plot
        },
        marks: [
            Plot.barX(data, {
                x: "co2Emissions",
                y: "region",
                fill: "color",
                title: d => `${d.city}: ${d.co2Emissions} CO₂`
            })
        ]
    });
}

// Dynamically generate labels based on `topNPerRegion`
function generateLabels(topNPerRegion) {
    const rankLabels = ["First", "Second", "Third", "Fourth", "Fifth"];
    const labels = rankLabels.slice(0, topNPerRegion); // Adjust labels based on the topNPerRegion value
    labels.push("Other", "Total emissions"); // Append "Other" and "Total emissions" labels
    return labels;
}

// Step 8: Create container with subplots
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
        const showYAxisLabels = index === 0; // Show y-axis only for the leftmost plot
        const subplot = createSubplot(data, orderedRegions, label, subplotWidth, height, showYAxisLabels);
        
        const subplotContainer = document.createElement("div");
        subplotContainer.appendChild(subplot);
        container.appendChild(subplotContainer);
    });

    return container;
}

// Main function to create the full visualization with modularized steps
function EmissionsByRegionStackedMultipleMini(data, regionsData, { width = 1600, height = 500, topNPerRegion = 5 } = {}) {
    // Constants and color palette

    
    const colorPalette = [
        "#FF8C00", // Orange
        "#FFD700", // Yellow
        "#6B8E23", // Olive green
        "#3CB371", // Sea green
        "#4682B4", // Steel blue
        "#4169E1", // Royal blue
        "#8A2BE2", // Blue violet
        "#A0522D", // Sienna
        "#696969", // Dim gray
    ];

    // Step 1-3: Data preparation and processing
    const preparedData = prepareData(data, regionsData);
    const regionalEmissions = calculateRegionalEmissions(preparedData);
    const topCitiesByRegion = selectTopCities(regionalEmissions, topNPerRegion, true, true);

    // Step 4-5: Generate mini-datasets based on rankings and order regions by total emissions
    const miniDatasets = generateMiniDatasets(topCitiesByRegion);
    const orderedRegions = Object.keys(miniDatasets[miniDatasets.length - 1].data)
        .sort((a, b) => miniDatasets[miniDatasets.length - 1].data[b][0].co2Emissions - miniDatasets[miniDatasets.length - 1].data[a][0].co2Emissions);

    // Step 6: Apply color palette to mini-datasets
    applyColorPalette(miniDatasets, orderedRegions, colorPalette);

    // Step 7-8: Create and return container with subplots
    return createSubplotContainer(miniDatasets, orderedRegions, width, height, topNPerRegion);
}



```

# Lazzarini's Part
## Top 5 CO₂ emitters (per capita) per region  - Stacked multiple🌍

<br>
<br>



<div class="grid grid-cols-1">
  <div class="card"> ${resize((width) => EmissionsByRegionStackedMultipleMini(dataset, RegionDataset, { width, topNPerRegion: 5}))} </div>
</div>

