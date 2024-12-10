---
theme: dashboard
title: laboratorio 4
toc: true
---

```js
const maxTemperatureTexas = await FileAttachment("data/MaxTemperatureTexas.csv").csv({ typed: true });
const minTemperatureTexas = await FileAttachment("data/MinTemperatureTexas.csv").csv({ typed: true });
const averageTemperatureTexas = await FileAttachment("data/AverageTemperatureTexas.csv").csv({ typed: true });
```

# Temperature 🌡️

<br>

## plot 4

<br>

```js
const traffic = await FileAttachment("data/fileprova.csv").csv({ typed: true });

function TrafficByDate(traffic, { width = 800, overlap = 4.5 } = {}) {
  const uniqueNames = new Set(traffic.map(d => d.name));
  const height = 40 + uniqueNames.size * 17;

  // Definiamo una scala di colori basata sui nomi
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);  // Usa una palette di colori

  return Plot.plot({
    height: 40 + new Set(traffic.map(d => d.name)).size * 17,
    width,
    marginBottom: 1,
    marginLeft: 120,
    x: { axis: "top" },
    y: { axis: null, range: [2.5 * 17 - 2, (2.5 - overlap) * 17 - 2] },
    fy: { label: null, domain: traffic.map(d => d.name) }, // preserve input order
    marks: [
      d3.groups(traffic, d => d.name).map(([name, values]) => [
        Plot.areaY(values, { 
          x: "date", 
          y: "value", 
          fy: "name", 
          curve: "basis", 
          sort: "date", 
          fill: colorScale(name) // Assegna un colore in base al nome
        }),
        Plot.lineY(values, { 
          x: "date", 
          y: "value", 
          fy: "name", 
          curve: "basis", 
          sort: "date", 
          strokeWidth: 1, 
          stroke: colorScale(name) // Linea colorata in base al nome
        })
      ])
    ]
  });
}


```
<div class="grid grid-cols-1">
  <div class="card"> ${resize((width) => TrafficByDate(traffic, { width }))} </div>
</div>




```js
function fahrenheitToCelsius(fahrenheit) {
  return (fahrenheit - 32) * 5 / 9;
}

function TemperatureByDate(maxTemperatureTexas, { width = 800, overlap = 4.5 } = {}) {
  maxTemperatureTexas.forEach(d => {d.TemperatureCelsius = fahrenheitToCelsius(d.Value);});
  const uniqueYears = new Set(maxTemperatureTexas.map(d => d.Year));
  const height = 40 + uniqueYears.size * 17;
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  return Plot.plot({
    height: height,
    width,
    marginBottom: 1,
    marginLeft: 120,
    x: { axis: "top" },
    y: { axis: null, range: [2.5 * 17 - 2, (2.5 - overlap) * 17 - 2] },
    fy: { label: null, domain: maxTemperatureTexas.map(d => d.Year) }, // Ordine in base agli anni
    marks: [
      d3.groups(maxTemperatureTexas, d => d.Year).map(([year, values]) => [
        Plot.areaY(values, { 
          x: "TemperatureCelsius",  // L'asse delle x sarà la temperatura in Celsius
          y: "Year", 
          fy: "Year", 
          curve: "basis", 
          sort: "TemperatureCelsius",  // Ordina per la temperatura
          fill: colorScale(year) // Assegna un colore per ogni anno
        }),
        Plot.lineY(values, { 
          x: "TemperatureCelsius",  // L'asse delle x sarà la temperatura in Celsius
          y: "Year", 
          fy: "Year", 
          curve: "basis", 
          sort: "TemperatureCelsius",  // Ordina per la temperatura
          strokeWidth: 1, 
          stroke: colorScale(year) // Linea colorata per ogni anno
        })
      ])
    ]
  });
}

```
<div class="grid grid-cols-1">
  <div class="card"> ${resize((width) => TemperatureByDate(maxTemperatureTexas, { width }))} </div>
</div>
