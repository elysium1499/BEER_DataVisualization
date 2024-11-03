---
theme: dashboard
title: Laboratory One
toc: false
---

### Best 20 Capita with low CO₂ Emissions in 2000 🌍

<!-- Load and transform the data -->
```js
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
function EmissionsByCapitalDecade(data, { width = 800 } = {}) {
    const totalEmissions = data.reduce((acc, d) => {
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
  <div class="card"> ${resize((width) => EmissionsByCapitalDecade(dataset, {width}))} </div> 
</div>
