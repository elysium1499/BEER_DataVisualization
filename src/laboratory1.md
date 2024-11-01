---
theme: dashboard
title: Laboratory One
toc: false
---

<!-- Load and transform the data -->
```js

//column: Entity,Code,Year,Annual CO₂ emissions (per capita)
const dataset = FileAttachment("data/co-emissions-per-capita.csv").csv({typed: true});
//column: Entity,Region
const RegionDataset = FileAttachment("data/region_entities.csv").csv({typed: true});

```


<!-- BarPlot that show the emission and the country in one year -->

### Best 20 Capita with high CO₂ Emissions in the Years 🌍

```js
const uniqueEntities = [...new Set(dataset.map(d => d.Year.toString()))].sort((a, b) => b - a);
const year = view(Inputs.select(uniqueEntities, {label: "📅 Choose Year"}));


function EmissionsByCapitalYear(data, year, { width = 800 } = {}) {
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
            label: "City",
            domain: coloredData.map(d => d.city),
            tickRotate: -45,
            tickSize: 10 
        },
        y: {
            label: "Annual CO₂ Emissions (per capita)",
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

### Best 20 Capita with high CO₂ Emissions in nearest decade (2011 to 2022) 🌍

```js
function EmissionsByCapitalDecade(data, { width = 800 } = {}) {
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

    const coloredCities = topCities.map((cityData, index) => ({
        ...cityData,
        color: colorPalette[index % colorPalette.length]
    }));


    return Plot.plot({
        height: 400,
        width,
        marginLeft: 60,
        marginBottom: 130,
        x: {
            label: "City",
            domain: coloredCities.map(d => d.city),
            tickRotate: -45,
            tickSize: 10
        },
        y: {
            label: "Total Annual CO₂ Emissions (per capita) over 10 Years",
            grid: true
        },
        marks: [
            Plot.barY(coloredCities, { 
                x: "city", 
                y: "co2Emissions", 
                fill: "color"
            })
        ]
    });
}

```

<div class="grid grid-cols-1"> 
  <div class="card"> ${resize((width) => EmissionsByCapitalDecade(dataset, {width}))} </div> 
</div>





<!-- BarPlot that show the emission and the country with high emission -->

### Region with high CO₂ Emissions 🌍

```js
function EmissionsByCapital(data, { width = 800 } = {}) {
    const totalEmissions = data
        .filter(d => d.Year >= 1991 && d.Year <= 2000)
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

    console.log(coloredCities);

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
            label: "",
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
