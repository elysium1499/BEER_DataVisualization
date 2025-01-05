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
/* Tema Scuro fisso */
:root {
  --theme-background: #121212;             /* Sfondo scuro */
  --theme-foreground: #ffffff;             /* Testo chiaro */
  --theme-foreground-muted: #b0bec5;       /* Testo secondario */
  --theme-border: #444444;                 /* Bordi */
  --theme-card-background: #1e1e1e;        /* Sfondo card */
  /*--theme-foreground-focus: #ffffff;       /* Evidenziazione nei gradienti */
}

/* Tema fisso indipendentemente dal sistema */
@media (prefers-color-scheme: light) {
  :root {
    --theme-background: #121212;
    --theme-foreground: #ffffff;
    --theme-foreground-muted: #b0bec5;
    --theme-border: #444444;
    --theme-card-background: #1e1e1e;
    /*--theme-foreground-focus: #ffffff;*/
  }
}

/* Corpo della pagina */
body {
  background-color: var(--theme-background);
  color: var(--theme-foreground);
}

/* Grafici SVG */
svg {
  background-color: var(--theme-background); /* Sfondo grafici */
}

text, svg text {
  fill: var(--theme-foreground); /* Colore testo nei grafici */
}

/* Assi nei grafici */
.axis line, .axis path {
  stroke: var(--theme-foreground-muted); /* Linee assi */
}

.axis text {
  fill: var(--theme-foreground-muted); /* Testo assi */
}

/* Contenitore delle card */
.cards-container {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Card */
.card {
  padding: 1rem;
  border: 1px solid var(--theme-border);
  border-radius: 8px;
  background-color: var(--theme-card-background); /* Sfondo card */
  color: var(--theme-foreground);
}

/* Sezione hero */
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: var(--sans-serif);
  margin: 4rem 0 8rem;
  text-wrap: balance;
  text-align: center;
}

/* Titolo hero */
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

/* Sottotitolo hero */
.hero h2 {
  margin: 0;
  max-width: 34em;
  font-size: 20px;
  font-style: initial;
  font-weight: 500;
  line-height: 1.5;
  color: var(--theme-foreground-muted);
}

/* Responsività */
@media (min-width: 640px) {
  .hero h1 {
    font-size: 90px;
  }
}

/* Sidebar */
.sidebar {
  background-color: var(--theme-background);  /* Sfondo scuro */
  color: var(--theme-foreground);            /* Testo chiaro */
  border-right: 1px solid var(--theme-border); /* Bordo scuro */
}

/* Link nella sidebar */
.sidebar a {
  color: var(--theme-foreground);             /* Link chiari */
  text-decoration: none;                      /* Nessuna sottolineatura */
}

.sidebar a:hover {
  color: var(--theme-foreground-muted);       /* Hover più tenue */
}

/* Toggle sidebar */
.sidebar-toggle {
  background-color: var(--theme-background);  /* Sfondo scuro */
  color: var(--theme-foreground);             /* Testo chiaro */
  border: 1px solid var(--theme-border);      /* Bordo coerente */
}

/* Icona del toggle */
.sidebar-toggle::before {
  content: "☰";                              /* Icona del menu (hamburger) */
  color: var(--theme-foreground);             /* Icona chiara */
}

/* Highlight nella sidebar (elementi selezionati) */
.sidebar .active {
  background-color: var(--theme-card-background); /* Sfondo per elemento selezionato */
  color: var(--theme-foreground);                 /* Testo selezionato chiaro */
}

</style>
