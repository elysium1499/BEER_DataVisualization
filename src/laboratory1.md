---
theme: dashboard
title: Laboratory One
toc: false
---


<!-- Load and transform the data -->

```js
const dataset = FileAttachment("data/co-emissions-per-capita.csv").csv({typed: true});
```


<!-- Bar Plot 1 using year -->


```js

function EmissionsByCapital(data, {width} = {}) {
    const data2000 = data.filter(d => d.year === 2000);

    return Plot.plot({
    title: "State and his emission in this year",
    width,
    height: 300,
    x: {label: "Capital Cities"},
    y: {grid: true, label: "CO₂ Emissions"},
    color: { legend: true},
    marks: [
        //Plot.rectY(data, Plot.binX({y: "count"}, {x: "date", fill: "state", interval: "year", tip: true})),
        Plot.barY(data2000, {x: "Entity", y: "Annual CO₂ emissions (per capita)", fill: "capital", tip: true}),
        Plot.ruleY([0])]
    });
}
```

<div class="grid grid-cols-1">
  <div class="card">
    ${resize((width) => EmissionsByCapital(dataset, {width}))}
  </div>
</div>


<!-- Bar Plot 2 using decade -->

<!-- Bar Plot 3  -->

<!-- Bar Plot 4  -->

<!-- HeatMap Plot 5  -->
