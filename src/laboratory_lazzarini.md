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

const colorPalette = [
    "#CC564D", // Dark Coral
    "#4FAAC4", // Dark Sky Blue
    "#D4AC40", // Dark Sunflower
    "#76B89F", // Dark Mint
    "#D87886", // Dark Soft Pink
    "#523D60", // Dark Velvet Purple
    "#C05568", // Dark Blush
    "#2A4A5F", // Dark Deep Blue
    "#9A506C", // Dark Rose
    "#6A6A68", // Dark Granite Gray
    "#BC7A60", // Dark Light Coral
    "#33907F", // Dark Seafoam
    "#AA8FA0", // Dark Lavender Blush
    "#1E292D", // Dark Charcoal
    "#86998F", // Dark Frosted Green
    "#B0885A", // Dark Sand
    "#7DA087", // Dark Moss Green
];

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

function selectTopCities(totalEmissionsByRegion, topN, includeOther = false, includeTotal = false) {
    let topCitiesByRegion = {};

    // Step 1: Build top cities for each region
    for (const region in totalEmissionsByRegion) {
        if (region === "Global") continue;
        
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
        // Assign a single color from the palette for each subplot based on its index
        dataset.color = colorPalette[index % colorPalette.length];
    });
}

// Step 7: Create a single subplot for a mini-dataset with optional text labels and centered x-axis label
function createSubplot(data, orderedRegions, label, width, height, showYAxisLabels, color, showText = true) {
    return Plot.plot({
        width,
        height,
        marginLeft: showYAxisLabels ? 60 : 20,
        marginBottom: 80,
        x: {
            label,
            labelAnchor: "center",
            grid: true,
            tickFormat: "s",
            tickSpacing: 50
        },
        y: {
            domain: orderedRegions,
            label: showYAxisLabels ? "Region" : null, // Only show y-axis label on the leftmost plot
            labelPosition: "top",
            ticks: showYAxisLabels ? orderedRegions : [], // Only show y-axis ticks on the leftmost plot
            //tickFormat: showYAxisLabels ? d => d : null // Only format y-axis tick labels on the leftmost plot
        },
        marks: [
            Plot.barX(data, {
                x: "co2Emissions",
                y: "region",
                fill: color, // Set a single color for the entire subplot
                title: d => `${d.city}: ${d.co2Emissions} CO₂`
            }),
            // Only add text labels if showText is true
            ...(showText ? [
                Plot.text(data, {
                    x: d => 250, // Position text slightly to the right of the bar
                    y: "region",
                    text: d => d.city,
                    dy: 0,
                    fontSize: 10,
                    textAnchor: "start", // Align text with the start of the bar
                    fill: "white" // Set text color to white for visibility
                })
            ] : [])
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
        const showYAxisLabels = index === 0; // Show y-axis only for the leftmost plot
        const showText = index < miniDatasets.length - 2; // Don't show text only for 'others' and 'total'
        const subplot = createSubplot(data, orderedRegions, label, subplotWidth, height, showYAxisLabels, dataset.color, showText);
        
        const subplotContainer = document.createElement("div");
        subplotContainer.appendChild(subplot);
        container.appendChild(subplotContainer);
    });

    return container;
}


// Main function to create the full visualization with modularized steps
function EmissionsByRegionStackedMultiple(data, regionsData, { width = 1600, height = 500, topNPerRegion = 5 } = {}) {
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

//------------------------------------------------------------------------------------------------
// Function to normalize emissions to percentages within each region
function normalizeEmissionsToPercentages(topCitiesByRegion) {
    Object.keys(topCitiesByRegion).forEach(region => {
        const totalEmissions = topCitiesByRegion[region].reduce((sum, city) => sum + city.co2Emissions, 0);
        topCitiesByRegion[region].forEach(city => {
            city.co2EmissionsPercent = (city.co2Emissions / totalEmissions) * 100;
        });
    });
}

// Function to create the SVG container
function createSvg(width, height) {
    return d3.create("svg")
        .attr("width", width)
        .attr("height", height);
}

// Function to create a Y scale for regions
function createYScale(topCitiesByRegion, height) {
    return d3.scaleBand()
        .domain(Object.keys(topCitiesByRegion))
        .range([0, height])
        .padding(0.2);
}

// Function to create an X scale for percentage
function createXScale(width) {
    return d3.scaleLinear()
        .domain([0, 100])
        .range([0, width]);
}

function renderBars(svg, topCitiesByRegion, xScale, yScale, topNPerRegion) {
    const color = d3.scaleOrdinal()
        .domain(d3.range(topNPerRegion + 1))
        .range(colorPalette);

    Object.entries(topCitiesByRegion).forEach(([region, cities]) => {
        let xOffset = 0;
        const group = svg.append("g")
            .attr("transform", `translate(0,${yScale(region)})`);

        // Render bars with city names overlapping
        group.selectAll("rect")
            .data(cities)
            .enter()
            .append("rect")
            .attr("x", d => xScale(xOffset += d.co2EmissionsPercent) - xScale(d.co2EmissionsPercent))
            .attr("width", d => xScale(d.co2EmissionsPercent))
            .attr("height", yScale.bandwidth())
            .attr("fill", (d, i) => color(i));

        // Add city names as text labels overlapping the bars
        xOffset = 0; // Reset xOffset for positioning text
        group.selectAll("text")
            .data(cities)
            .enter()
            .append("text")
            .attr("x", d => xScale(xOffset += d.co2EmissionsPercent) - xScale(d.co2EmissionsPercent) / 2) // Center of each bar
            .attr("y", yScale.bandwidth() / 2) // Center vertically within the bar
            .attr("dy", "0.35em") // Adjust for vertical alignment
            .attr("text-anchor", "middle")
            .attr("fill", "white") // Set text color for readability; adjust if needed
            .style("font-size", "8px") // Adjust font size as needed
            .text(d => d.city);
    });
}

// Function to add Y-axis labels for regions
function addYAxis(svg, yScale) {
    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale));
}

// Function to add X-axis with scale for percentage
function addXAxis(svg, xScale, width, height) {
    // Detect if the browser is in dark mode
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const textColor = isDarkMode ? "white" : "black";

    // Append x-axis with percentage ticks
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => `${d}%`)) // Set ticks and format as percentages
        .selectAll("text")
        .attr("fill", textColor);

    // Append x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 30)
        .attr("text-anchor", "middle")
        .attr("fill", textColor)
        .text("CO₂ Emissions (%)")
        .style("font-size", "10px") // Adjust font size as needed
}

// Main function to generate the stacked 100% bar chart
function EmissionsByRegion100PercentStacked(data, regionsData, { width = 1600, height = 350, topNPerRegion = 5 } = {}) {
    // Step 1: Data preparation
    const preparedData = prepareData(data, regionsData);
    const regionalEmissions = calculateRegionalEmissions(preparedData);
    const topCitiesByRegion = selectTopCities(regionalEmissions, topNPerRegion, true, false);

    // Step 2: Normalize emissions to percentages
    normalizeEmissionsToPercentages(topCitiesByRegion);

    // Step 3: Set up and render chart
    const svg = createSvg(width, height);
    const yScale = createYScale(topCitiesByRegion, height);
    const xScale = createXScale(width);

    renderBars(svg, topCitiesByRegion, xScale, yScale, topNPerRegion);
    addYAxis(svg, yScale);
    addXAxis(svg, xScale, width, height);

    return svg.node();
}


```

# Lazzarini's Part
## Top 5 CO₂ emitters (per capita) per region  - Stacked multiple🌍
<br>
<br>
<div class="grid grid-cols-1">
  <div class="card">${resize(width => EmissionsByRegionStackedMultiple(dataset, RegionDataset, { width, topNPerRegion: 5 }))}</div>
</div>

## Top 5 CO₂ emitters (per capita) per region  - Stacked 100%🌍
<br>
<br>
<div class="grid grid-cols-1">
  <div class="card">${resize(width => EmissionsByRegion100PercentStacked(dataset, RegionDataset, { width, topNPerRegion: 5 }))}</div>
</div>
