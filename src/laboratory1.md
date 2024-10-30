---
theme: dashboard
title: Example dashboard
toc: false
---

# Rocket launches 🚀

<!-- Load and transform the data -->

```js
const launches = FileAttachment("data/launches.csv").csv({typed: true});
```