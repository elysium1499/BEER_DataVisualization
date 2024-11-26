---
title: Introduction
toc: false
---
<div class="hero">
  <h1>CO₂ emissions</h1>
  <h1 style="font-size: 30px;">Welcome to our site! We are the BEER group!</h1>
  <h2>Members of the group:</h2>
  <div class="cards-container">
    <div class="card">Elisa Calza S4700104</div>
    <div class="card">Bilal Khateeb S5835711</div>
    <div class="card">Roberto Lazzarini S4937188</div>
    <div class="card">Elena Martino S4702492</div>
  </div>
</div>

<style>
  .cards-container {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }
  .card {
    padding: 1rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    background-color: #00000;   
  }

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