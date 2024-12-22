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
const selectedMod = view(Inputs.select(
  ["Line", "Filled Area"], {label: "📊 Select Plot Type"}
));

function RidgelinePlot(temperatureData, selectedMod,{ width = 800, overlap = 3 } = {}) {
  const parsedData = temperatureData.map(d => ({
    year: Math.floor(d.Date / 100).toString(), 
    month: d.Date % 100,
    average: +fahrenheitToCelsius(d.Average),
    maximum: +fahrenheitToCelsius(d.Maximum),
    minimum: +fahrenheitToCelsius(d.Minimum)
  }));

  const groupedData = d3.groups(parsedData, d => d.year);

  // Definire l'intervallo fisso delle temperature da -50 a +50°C
  const temperatureRange = [-50, 50];

  // Creazione delle distribuzioni in un'unica variabile
  const allDistributions = groupedData.map(([year, data]) => {
    const bin = d3.bin()
      .domain(temperatureRange)
      .thresholds(30);

    const minBins = bin(data.map(d => d.minimum)).map(bin => ({
      year,
      temperature: (bin.x0 + bin.x1) / 2,
      count: bin.length,
      type: 'min'
    }));

    const avgBins = bin(data.map(d => d.average)).map(bin => ({
      year,
      temperature: (bin.x0 + bin.x1) / 2,
      count: bin.length,
      type: 'avg'
    }));

    const maxBins = bin(data.map(d => d.maximum)).map(bin => ({
      year,
      temperature: (bin.x0 + bin.x1) / 2,
      count: bin.length,
      type: 'max'
    }));

    return [...minBins, ...avgBins, ...maxBins];
  }).flat();

  if(selectedMod == "Line"){
    return Plot.plot({
      height: 40 + groupedData.length * 65,
      width,
      marginBottom: 50,
      marginLeft: 70,
      x: { axis: "bottom", label: "Temperature (°C)" },
      y: { axis: null, range: [2.5 * 25 - 2, (2.5 - overlap) * 25 - 2] },
      fy: { label: "Year", domain: groupedData.map(([year]) => year) },
      marks: [
        Plot.lineY(allDistributions.filter(d => d.type === 'min'), {
          x: "temperature",
          y: "count",
          fy: "year",
          curve: "basis",
          strokeWidth: 1, 
          stroke: "#1f77b4"
        }),
        Plot.lineY(allDistributions.filter(d => d.type === 'avg'), {
          x: "temperature",
          y: "count",
          fy: "year",
          curve: "basis",
          strokeWidth: 1, 
          stroke: "#2ca02c"
        }),
        Plot.lineY(allDistributions.filter(d => d.type === 'max'), {
          x: "temperature",
          y: "count",
          fy: "year",
          curve: "basis",
          strokeWidth: 1, 
          stroke: "#d62728"
        })
      ],
    });
  }
  else{
    return Plot.plot({
      height: 40 + groupedData.length * 65,
      width,
      marginBottom: 50,
      marginLeft: 70,
      x: { axis: "bottom", label: "Temperature (°C)" },
      y: { axis: null, range: [2.5 * 25 - 2, (2.5 - overlap) * 25 - 2] },
      fy: { label: "Year", domain: groupedData.map(([year]) => year) },
      marks: [
        Plot.areaY(allDistributions.filter(d => d.type === 'min'), {
          x: "temperature",
          y: "count",
          fy: "year",
          fill: "#1f77b4",
          curve: "basis",
          opacity: 0.6,
        }),
        Plot.areaY(allDistributions.filter(d => d.type === 'avg'), {
          x: "temperature",
          y: "count",
          fy: "year",
          fill: "#2ca02c", // Colore per le medie
          curve: "basis",
          opacity: 0.6,
        }),
        Plot.areaY(allDistributions.filter(d => d.type === 'max'), {
          x: "temperature",
          y: "count",
          fy: "year",
          fill: "#d62728", // Colore per le massime
          curve: "basis",
          opacity: 0.6,
        })
      ],
    });
  }
}
```
<div class="grid grid-cols-1">
  <div class="card"> ${resize((width) => RidgelinePlot(TemperatureTexas, selectedMod, { width }))} </div>
</div>
