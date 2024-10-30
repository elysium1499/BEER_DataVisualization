---
toc: false
---

<div class="hero">
  <h1>DataVisualization</h1>
  <h1>Welcome in this our app! We are the BEER group!.</h1>
  <h2>Member of the group are:</h2>
  <div class="card">Elisa Calza S4700104.</div>
  <div class="card">Bilal Khateeb S5835711.</div>
  <div class="card">Roberto Lazzarini S.</div>
  <div class="card">Elena Martino S.</div>
</div>

<style>
  .hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: var(--sans-serif);
    margin: 4rem 0 8rem;
    text-wrap: balance;
    text-align: center;
  }

  .hero h1 {
    margin: 1rem 0;
    padding: 1rem 0;
    max-width: none;
    font-size: 14vw;
    font-weight: 900;
    line-height: 1;
    background: linear-gradient(30deg, var(--theme-foreground-focus), currentColor);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero h2 {
    margin: 0;
    max-width: 34em;
    font-size: 20px;
    font-style: initial;
    font-weight: 500;
    line-height: 1.5;
    color: var(--theme-foreground-muted);
  }

  @media (min-width: 640px) {
    .hero h1 {
      font-size: 90px;
    }
  }
</style>