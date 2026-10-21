---
layout: default
title: Visitors
description: Homepage views and visitor map for Ahin Lee's site.
permalink: /visitors/
---

{% assign profile = site.data.profile %}

<section class="travel-hero shell">
  <div class="travel-panel">
    <div class="travel-panel-copy">
      <p class="travel-eyebrow">Statistics</p>
      <div class="travel-heading-row">
        <h1>Visitors</h1>
      </div>
    </div>
  </div>
</section>

<section class="news-page shell">
  <div class="rail-card news-page-card">
    <div class="visitor-stats">
      <figure>
        <figcaption class="muted">Homepage views</figcaption>
        <img src="https://hits.sh/www.ahinlee.com.svg?label=VIEWS&color=1f2f6b&labelColor=555555" alt="Homepage views" height="30">
      </figure>
      {% if profile.mapmyvisitors_id %}
      <figure>
        <figcaption class="muted">Visitor map</figcaption>
        <div class="visitor-map"><script type="text/javascript" id="mapmyvisitors" src="https://mapmyvisitors.com/map.js?cl=ffffff&w=a&t=n&d={{ profile.mapmyvisitors_id }}"></script></div>
      </figure>
      {% endif %}
    </div>
    <a class="map-back-link news-back-link" href="{{ '/' | relative_url }}">Back to home</a>
  </div>
</section>
