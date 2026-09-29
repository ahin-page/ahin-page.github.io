---
layout: default
title: News
description: All news and updates from Ahin Lee.
permalink: /news/
---

{% assign news_items = site.data.news %}

<section class="travel-hero shell">
  <div class="travel-panel">
    <div class="travel-panel-copy">
      <p class="travel-eyebrow">Updates</p>
      <div class="travel-heading-row">
        <h1>News</h1>
        <div class="travel-stat-pill" aria-label="News summary">
          <strong>{{ news_items | size }}</strong>
          <span>Updates</span>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="news-page shell">
  <div class="rail-card news-page-card">
    <ul class="news-list news-list--full">
      {% for item in news_items %}
      <li>
        <span class="news-date">{{ item.date }}</span>
        <span class="news-text">{{ item.text }}</span>
      </li>
      {% endfor %}
    </ul>
    <a class="map-back-link news-back-link" href="{{ '/' | relative_url }}">Back to home</a>
  </div>
</section>
