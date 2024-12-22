---
theme: dashboard
title: laboratorio 4
toc: true
---

```js
const TemperatureTexas = await FileAttachment("data/Temp.csv").csv({ typed: true });

function fahrenheitToCelsius(f) {
  return ((f - 32) * 5) / 9;
}
```

# Temperature 🌡️
<br>

## LINECHART
<br>

```js
const selectedYear = view(Inputs.select(
  [...new Set(TemperatureTexas.map(d => d.Date.toString().slice(0, 4)))].sort((a, b) => b - a), 
  {label: "📅 Select a Year"})
);

function LineChartForYear(data, selectedYear, { width = 800 } = {}) {
  const filteredData = data.filter(d => {
    const year = String(d["Date"]).slice(0, 4);
    return year === String(selectedYear);
  });

  return Plot.plot({
    marginLeft: 100,
    width,
    y: {
      grid: true,
      label: "Temperature (°C)"
    },
    x: {
      grid: true,
      label: "Month",
    },
    marks: [
      Plot.ruleY([0]),

      // Linea Massima
      Plot.lineY(filteredData, {
        x: d => String(d["Date"]).slice(4, 6),
        y: d => fahrenheitToCelsius(d["Maximum"]),
        stroke: "red"
      }),
      Plot.dot(filteredData, {
        x: d => String(d["Date"]).slice(4, 6),
        y: d => fahrenheitToCelsius(d["Maximum"]),
        fill: "red",
        r: 3,
        tip: true, // Tooltip immediato e interattivo
        title: d => `🔴 Maximum: ${fahrenheitToCelsius(d["Maximum"]).toFixed(2)}°C`
      }),

      // Linea Minima
      Plot.lineY(filteredData, {
        x: d => String(d["Date"]).slice(4, 6),
        y: d => fahrenheitToCelsius(d["Minimum"]),
        stroke: "blue"
      }),
      Plot.dot(filteredData, {
        x: d => String(d["Date"]).slice(4, 6),
        y: d => fahrenheitToCelsius(d["Minimum"]),
        fill: "blue",
        r: 3,
        tip: true, // Tooltip immediato e interattivo
        title: d => `🔵 Minimum: ${fahrenheitToCelsius(d["Minimum"]).toFixed(2)}°C`
      }),

      // Linea Media (tratteggiata)
      Plot.lineY(filteredData, {
        x: d => String(d["Date"]).slice(4, 6),
        y: d => fahrenheitToCelsius(d["Average"]),
        stroke: "green",
        strokeDasharray: "4,4"
      }),
      Plot.dot(filteredData, {
        x: d => String(d["Date"]).slice(4, 6),
        y: d => fahrenheitToCelsius(d["Average"]),
        fill: "green",
        r: 3,
        tip: true, // Tooltip immediato e interattivo
        title: d => `🟢 Average: ${fahrenheitToCelsius(d["Average"]).toFixed(2)}°C`
      })
    ]
  });
}
```

<div class="grid grid-cols-1">
  <div class="card"> ${resize((width) => LineChartForYear(TemperatureTexas, selectedYear, { width }))} </div>
</div>

<br>

## RADARCHART

```js
// Import D3
import * as d3 from "d3";

// Funzione per calcolare dimensioni responsive
function getResponsiveDimensions() {
  const container = document.querySelector("#radar-chart-container");
  const width = container.clientWidth;
  const height = Math.min(width, 600); // Manteniamo un'altezza massima
  const margin = 35;
  const radius = Math.min(width, height) / 2 - margin;
  return { width, height, margin, radius };
}

// Load datasets
const datasetTemp = await FileAttachment("data/Temp.csv").csv({ typed: true });

// Parse dataset
function parseDataset(dataset) {
  return dataset.map(row => {
    const dateString = String(row.Date);
    const year = parseInt(dateString.slice(0, 4), 10);
    const month = parseInt(dateString.slice(4, 6), 10);
    return {
      year,
      month,
      mean: +row.Average,
      min: +row.Minimum,
      max: +row.Maximum,
    };
  });
}

const processedData = parseDataset(datasetTemp);

// Group data by year
function groupDataByYear(data) {
  return d3.group(data, d => d.year);
}

const dataByYear = groupDataByYear(processedData);

// Calcola la media di tutti gli anni
const allYearsMean = Array.from({ length: 12 }, (_, month) => {
  const monthlyData = processedData.filter(d => d.month === month + 1);
  const avg = d3.mean(monthlyData, d => d.mean);
  return avg || 0;
});

// Dati iniziali
let { width, height, margin, radius } = getResponsiveDimensions();

// Creazione del contenitore SVG
let svg = d3
  .select("#radar-chart")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .style("margin", "0 auto") // Centro all'interno del div
  .append("g")
  .attr("transform", `translate(${width / 2}, ${height / 2})`);

// Radar chart scales
const angleSlice = (Math.PI * 2) / 12; // 12 months
const rScale = d3
  .scaleLinear()
  .domain([0, d3.max(processedData, d => d.max)])
  .range([0, radius]);

// Tooltip
const tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("display", "none")
  .style("position", "absolute")
  .style("background", "black")
  .style("border", "1px solid #ccc")
  .style("padding", "5px")
  .style("border-radius", "5px")
  .style("font-size", "12px");

// Anni per il dropdown
const years = Array.from(dataByYear.keys());
const dropdown = d3.select("#year-dropdown");

// Aggiunta opzioni dropdown
dropdown
  .selectAll("option")
  .data(years)
  .enter()
  .append("option")
  .attr("value", d => d)
  .text(d => d);

// Funzione per aggiornare il radar chart
function updateRadarChart(year) {
  svg.selectAll(".chart-elements").remove();

  const yearData = dataByYear.get(year) || [];
  const monthlyMin = Array(12).fill(0);
  const monthlyMean = Array(12).fill(0);
  const monthlyMax = Array(12).fill(0);

  yearData.forEach(d => {
    monthlyMin[d.month - 1] = d.min;
    monthlyMean[d.month - 1] = d.mean;
    monthlyMax[d.month - 1] = d.max;
  });

  const datasets = [
    { name: "Min Temp", data: [...monthlyMin, monthlyMin[0]], color: "steelblue" },
    { name: "Avg Temp", data: [...monthlyMean, monthlyMean[0]], color: "green" },
    { name: "Max Temp", data: [...monthlyMax, monthlyMax[0]], color: "red" },
    { name: "All Years Avg", data: [...allYearsMean, allYearsMean[0]], color: "orange" },
  ];

  // Griglia e assi
  const gridLevels = 4;
  for (let i = 1; i <= gridLevels; i++) {
    const radiusAtLevel = (i / gridLevels) * radius;

    svg
      .append("circle")
      .attr("class", "chart-elements")
      .attr("r", radiusAtLevel)
      .attr("fill", "none")
      .attr("stroke", "#ccc");

    svg
      .append("text")
      .attr("class", "chart-elements")
      .attr("x", radiusAtLevel)
      .attr("y", 0)
      .attr("text-anchor", "middle")
      .text(Math.round((i / gridLevels) * d3.max(processedData, d => d.max)))
      .style("font-size", "12px")
      .style("fill", "#fff");
  }

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const axesGroup = svg.append("g").classed("chart-elements", true);

  months.forEach((month, i) => {
    const x = radius * Math.cos(angleSlice * i - Math.PI / 2);
    const y = radius * Math.sin(angleSlice * i - Math.PI / 2);

    axesGroup
      .append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", x)
      .attr("y2", y)
      .attr("stroke", "#ccc");

    axesGroup
      .append("text")
      .attr("x", x * 1.08)
      .attr("y", y * 1.08)
      .attr("text-anchor", "middle")
      .text(month)
      .style("font-size", "14px")
      .style("fill", "#fff");
  });

  datasets.forEach(dataset => {
    const line = d3
      .lineRadial()
      .radius((d, i) => rScale(d))
      .angle((_, i) => i * angleSlice);

    svg
      .append("path")
      .attr("class", "chart-elements")
      .datum(dataset.data)
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", dataset.color)
      .attr("stroke-width", 2);
  });
}

// Funzione per ridimensionare il grafico
function resizeChart() {
  const dimensions = getResponsiveDimensions();
  width = dimensions.width;
  height = dimensions.height;
  margin = dimensions.margin;
  radius = dimensions.radius;

  svg
    .attr("width", width)
    .attr("height", height)
    .select("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  rScale.range([0, radius]);
  updateRadarChart(years[0]);
}


// Autoplay button
const playButton = d3.select("#auto-play-button");
let animationInterval;
let currentYearIndex = 0;

// Play button functionality
playButton.on("click", () => {
  clearInterval(animationInterval);
  animationInterval = setInterval(() => {
    updateRadarChart(years[currentYearIndex]);
    dropdown.property("value", years[currentYearIndex]);
    currentYearIndex = (currentYearIndex + 1) % years.length; // Loop back to first year
  }, 1000); // Set interval to 1 second
});

const stopButton = d3.select("#stop-button");

// Stop button functionality
stopButton.on("click", () => {
  clearInterval(animationInterval);
});

window.addEventListener("resize", resizeChart);
updateRadarChart(years[0]);

```
<div id="radar-chart-container" style="width: 100%; max-width: 750px; margin: 100px auto; padding: 1px; border: 0.2px solid rgba(59, 55, 55, 0.7); border-radius: 10px; background-color: rgba(31, 29, 29, 0.7); text-align: center;">
    <div id="radar-chart" style="width: 100%; height: auto; margin-bottom: 30px;"></div>
    <div id="chart-legend" style="margin-bottom: 20px;"></div>
    <div id="dropdown-container" style="display: flex; justify-content: center; align-items: center; gap: 10px; margin-bottom: 10px;">
        <span>Select a Year:</span>
        <select id="year-dropdown"></select>
        <button id="auto-play-button">Auto Play</button>
        <button id="stop-button">Stop</button>
    </div>
    <div id="heatmap-container"></div>
</div>



## RIDGELINE

<br>

```js
const traffic = await FileAttachment("data/fileprova.csv").csv({ typed: true });

function createRidgelineChart(traffic, config = {}) {
  // Configurazione opzionale
  const {
    overlap = 8,
    width = 928,
    marginTop = 40,
    marginRight = 20,
    marginBottom = 30,
    marginLeft = 120,
  } = config;

  // Prepara le serie di dati
  const dates = Array.from(d3.group(traffic, d => +d.date).keys()).sort(d3.ascending);
  const series = d3.groups(traffic, d => d.name).map(([name, values]) => {
    const value = new Map(values.map(d => [+d.date, d.value]));
    return { name, values: dates.map(d => value.get(d)) };
  });

  // Dimensioni del grafico
  const height = series.length * 17;

  // Crea le scale
  const x = d3.scaleTime()
      .domain(d3.extent(dates))
      .range([marginLeft, width - marginRight]);

  const y = d3.scalePoint()
      .domain(series.map(d => d.name))
      .range([marginTop, height - marginBottom]);

  const z = d3.scaleLinear()
      .domain([0, d3.max(series, d => d3.max(d.values))]).nice()
      .range([0, -overlap * y.step()]);

  // Generatore di aree e linee
  const area = d3.area()
      .curve(d3.curveBasis)
      .defined(d => !isNaN(d))
      .x((d, i) => x(dates[i]))
      .y0(0)
      .y1(d => z(d));

  const line = area.lineY1();

  // Crea il contenitore SVG
  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");

  // Aggiunge gli assi
  svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x)
          .ticks(width / 80)
          .tickSizeOuter(0));

  svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y).tickSize(0).tickPadding(4))
      .call(g => g.select(".domain").remove());

  // Aggiunge i livelli per ogni serie
  const group = svg.append("g")
    .selectAll("g")
    .data(series)
    .join("g")
      .attr("transform", d => `translate(0,${y(d.name) + 1})`);

  group.append("path")
      .attr("fill", "#ddd")
      .attr("d", d => area(d.values));

  group.append("path")
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("d", d => line(d.values));

  return svg.node();
}





function TrafficByDate(traffic, { width = 800, overlap = 4.5 } = {}) {
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  return Plot.plot({
    height: 40 + new Set(traffic.map(d => d.name)).size * 17,
    width,
    marginBottom: 1,
    marginLeft: 120,
    x: { axis: "top" },
    y: { axis: null, range: [2.5 * 17 - 2, (2.5 - overlap) * 17 - 2] },
    fy: { label: null, domain: traffic.map(d => d.name) },
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

<div class="grid grid-cols-1">
  <div class="card"> ${resize((width) => createRidgelineChart(traffic))} </div>
</div>


```js
function RidgelinePlot(temperatureData, { width = 800, overlap = 3 } = {}) {
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
  const temperature = d3.groups(temperatureData, d => d.year).map(([year, values]) => {
    return {
      year,
      data: values.map(d => d.Data),
      averages: values.map(d => d.average),
      maximums: values.map(d => d.maximum),
      minimums: values.map(d => d.minimum)
    };
  });

  return Plot.plot({
    height: 40 + new Set(temperature.map(d => d.year)).size * 17,
    width,
    marginBottom: 1,
    marginLeft: 120,
    x: { axis: "top" },
    y: { axis: null, range: [2.5 * 17 - 2, (2.5 - overlap) * 17 - 2] },
    fy: { label: null, domain: temperature.map(d => d.year) },
    marks: [
      d3.groups(temperature, d => d.Date).map(([year, values]) => [
        Plot.lineY(values, { 
          x: "date", 
          y: "average", 
          fy: "year", 
          curve: "basis", 
          sort: "date", 
          strokeWidth: 1, 
          stroke: colorScale(Date)
        })
      ])
    ]
  });
}
```
<div class="grid grid-cols-1">
  <div class="card"> ${resize((width) => RidgelinePlot(TemperatureTexas, { width }))} </div>
</div>
