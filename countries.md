---
layout: default
title: World Map
description: A world map of countries Ahin Lee has visited.
permalink: /countries/
page_scripts:
  - /assets/d3.v7.min.js
  - /assets/countries-map.js
---

{% assign travel = site.data.travel %}
{% assign visited_count = travel.countries | size %}

<section class="travel-hero shell">
  <div class="travel-panel">
    <div class="travel-panel-copy">
      <p class="travel-eyebrow">Diverse Experiences</p>
      <div class="travel-heading-row">
        <h1>{{ travel.page_title }}</h1>
        <div class="travel-stat-pill" aria-label="Travel summary">
          <strong>{{ visited_count }}</strong>
          <span>Countries visited</span>
        </div>
      </div>
      <p class="travel-intro">{{ travel.page_intro }}</p>
    </div>
  </div>
</section>

<section class="travel-map-shell shell">
  <div class="map-frame">
    <div class="map-toolbar">
      <div class="map-controls" aria-label="Map zoom controls">
        <button type="button" class="map-control-button" data-map-zoom="in" aria-label="Zoom in">+</button>
        <button type="button" class="map-control-button" data-map-zoom="out" aria-label="Zoom out">-</button>
        <button type="button" class="map-control-button map-control-button--reset" data-map-zoom="reset">Reset</button>
      </div>
      <div class="map-toolbar-meta">
        <p class="map-hint">Scroll to zoom, drag to move.</p>
        <a class="map-back-link" href="{{ '/' | relative_url }}">Back to home</a>
      </div>
    </div>
    <svg
      id="visited-world-map"
      class="world-map world-map--accurate"
      viewBox="0 0 1000 560"
      role="img"
      aria-labelledby="world-map-title world-map-desc"
      data-geojson="{{ '/assets/world.geojson' | relative_url }}?v={{ site.time | date: '%s' }}"
    >
      <title id="world-map-title">{{ travel.page_title }}</title>
      <desc id="world-map-desc">A world map with country boundaries, highlighted visited countries, and pinned visited places.</desc>
    </svg>
    <div class="map-legend" aria-label="Visited countries">
      {% for country in travel.countries %}
      <article
        class="map-legend-item"
        data-country-name="{{ country.name }}"
        data-country-map-name="{{ country.map_name | default: country.name }}"
        data-country-emoji="{{ country.emoji }}"
        data-country-theme="{{ country.theme | default: '' }}"
        tabindex="0"
        role="button"
        aria-pressed="false"
      >
        <span class="map-legend-swatch{% if country.theme == 'home' %} map-legend-swatch--home{% endif %}" aria-hidden="true"></span>
        <div>
          <strong>{{ country.name }}</strong>
          <p>{{ country.region }}</p>
        </div>
      </article>
      {% endfor %}
    </div>
    <p class="map-caption">Visited countries are filled in blue. Very small countries may appear as dots. Hover to see the flag, then zoom in to inspect borders more closely.</p>
    <div class="map-hover-card" aria-hidden="true"></div>
  </div>
</section>

<script id="travel-map-data" type="application/json">
[
  {% for country in travel.countries %}
  {
    "name": {{ country.name | jsonify }},
    "mapName": {{ country.map_name | default: country.name | jsonify }},
    "region": {{ country.region | jsonify }},
    "emoji": {{ country.emoji | jsonify }},
    "theme": {{ country.theme | jsonify }},
    "note": {{ country.note | jsonify }},
    "lat": {{ country.lat | jsonify }},
    "lng": {{ country.lng | jsonify }},
    "labelDx": {{ country.label_dx | default: 16 | jsonify }},
    "labelDy": {{ country.label_dy | default: -18 | jsonify }},
    "labelAnchor": {{ country.label_anchor | default: "start" | jsonify }}
  }{% unless forloop.last %},{% endunless %}
  {% endfor %}
]
</script>
