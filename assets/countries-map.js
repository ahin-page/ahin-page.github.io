document.addEventListener("DOMContentLoaded", async () => {
  const worldSvg = document.getElementById("visited-world-map");
  const dataScript = document.getElementById("travel-map-data");
  const controls = Array.from(document.querySelectorAll("[data-map-zoom]"));
  const legendItems = Array.from(document.querySelectorAll(".map-legend-item"));
  const tooltip = document.querySelector(".map-hover-card");

  if (!worldSvg || !dataScript || !window.d3 || !tooltip) {
    return;
  }

  const d3 = window.d3;
  const width = 1000;
  const height = 560;
  const inset = 24;

  let visitedCountries;

  try {
    visitedCountries = JSON.parse(dataScript.textContent);
  } catch (error) {
    console.error("Failed to parse travel map data.", error);
    return;
  }

  const visitedByMapName = new Map(
    visitedCountries.map((country) => [country.mapName || country.name, country]),
  );

  try {
    const response = await fetch(worldSvg.dataset.geojson);

    if (!response.ok) {
      throw new Error(`Failed to load ${worldSvg.dataset.geojson}: ${response.status}`);
    }

    const geojson = await response.json();
    const projection = d3
      .geoNaturalEarth1()
      .fitExtent(
        [
          [inset, inset],
          [width - inset, height - inset],
        ],
        geojson,
      );
    const path = d3.geoPath(projection);
    const graticule = d3.geoGraticule10();
    const root = d3.select(worldSvg);
    const featureByMapName = new Map();
    const pointByMapName = new Map();
    const legendByMapName = new Map();
    let selectedMapName = null;

    root.selectAll("*").remove();
    root.attr("viewBox", `0 0 ${width} ${height}`);

    root.append("rect").attr("class", "map-ocean").attr("width", width).attr("height", height);

    const zoomLayer = root.append("g").attr("class", "map-zoom-layer");

    zoomLayer.append("path").attr("class", "map-sphere").attr("d", path({ type: "Sphere" }));
    zoomLayer.append("path").attr("class", "map-graticule").attr("d", path(graticule));

    const countries = zoomLayer
      .append("g")
      .attr("class", "map-countries")
      .selectAll("path")
      .data(geojson.features)
      .join("path")
      .attr("class", (feature) => {
        const country = visitedByMapName.get(feature.properties.name);

        if (!country) {
          return "map-country";
        }

        return country.theme === "home"
          ? "map-country map-country--visited map-country--home"
          : "map-country map-country--visited";
      })
      .attr("d", path);

    countries.each(function eachCountry(feature) {
      if (visitedByMapName.has(feature.properties.name)) {
        featureByMapName.set(feature.properties.name, {
          feature,
          element: d3.select(this),
        });
      }
    });

    countries
      .filter((feature) => visitedByMapName.has(feature.properties.name))
      .style("cursor", "pointer")
      .on("mouseenter", (event, feature) => {
        const country = visitedByMapName.get(feature.properties.name);
        showTooltip(tooltip, country);
        positionTooltip(tooltip, event.clientX, event.clientY);
      })
      .on("mousemove", (event) => {
        positionTooltip(tooltip, event.clientX, event.clientY);
      })
      .on("mouseleave", () => {
        hideTooltip(tooltip);
      });

    const microMarkers = zoomLayer.append("g").attr("class", "map-micro-countries");

    visitedCountries.forEach((country) => {
      const mapName = country.mapName || country.name;

      if (featureByMapName.has(mapName)) {
        return;
      }

      const point = projection([country.lng, country.lat]);

      if (!point) {
        return;
      }

      const [x, y] = point;
      const marker = microMarkers
        .append("g")
        .attr("class", "map-micro-country")
        .attr("transform", `translate(${x}, ${y})`)
        .style("cursor", "pointer");

      marker.append("circle").attr("class", "map-micro-country-ring").attr("r", 9);
      marker.append("circle").attr("class", "map-micro-country-dot").attr("r", 4.5);

      marker
        .on("mouseenter", (event) => {
          showTooltip(tooltip, country);
          positionTooltip(tooltip, event.clientX, event.clientY);
        })
        .on("mousemove", (event) => {
          positionTooltip(tooltip, event.clientX, event.clientY);
        })
        .on("mouseleave", () => {
          hideTooltip(tooltip);
        });

      pointByMapName.set(mapName, {
        x,
        y,
        element: marker,
      });
    });

    const zoom = d3
      .zoom()
      .scaleExtent([1, 10])
      .translateExtent([
        [-220, -140],
        [width + 220, height + 140],
      ])
      .extent([
        [0, 0],
        [width, height],
      ])
      .on("zoom", (event) => {
        zoomLayer.attr("transform", event.transform);
      });

    root.call(zoom);
    root.on("dblclick.zoom", null);

    controls.forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.dataset.mapZoom;

        if (action === "in") {
          root.transition().duration(180).call(zoom.scaleBy, 1.6);
        } else if (action === "out") {
          root.transition().duration(180).call(zoom.scaleBy, 1 / 1.6);
        } else if (action === "reset") {
          clearSelection();
          root.transition().duration(220).call(zoom.transform, d3.zoomIdentity);
        }
      });
    });

    legendItems.forEach((item) => {
      const country = {
        name: item.dataset.countryName,
        mapName: item.dataset.countryMapName,
        emoji: item.dataset.countryEmoji,
        theme: item.dataset.countryTheme,
      };
      legendByMapName.set(country.mapName, item);

      item.addEventListener("mouseenter", (event) => {
        showTooltip(tooltip, country);
        positionTooltip(tooltip, event.clientX, event.clientY);
      });

      item.addEventListener("mousemove", (event) => {
        positionTooltip(tooltip, event.clientX, event.clientY);
      });

      item.addEventListener("mouseleave", () => {
        hideTooltip(tooltip);
      });

      item.addEventListener("click", () => {
        toggleSelection(country.mapName);
      });

      item.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggleSelection(country.mapName);
        }
      });
    });

    function clearSelection() {
      if (!selectedMapName) {
        return;
      }

      const previousFeature = featureByMapName.get(selectedMapName);
      const previousPoint = pointByMapName.get(selectedMapName);
      const previousLegend = legendByMapName.get(selectedMapName);

      if (previousFeature) {
        previousFeature.element.classed("map-country--selected", false);
      }

      if (previousPoint) {
        previousPoint.element.classed("map-micro-country--selected", false);
      }

      if (previousLegend) {
        previousLegend.classList.remove("map-legend-item--active");
        previousLegend.setAttribute("aria-pressed", "false");
      }

      selectedMapName = null;
    }

    function focusCountry(mapName) {
      const selected = featureByMapName.get(mapName);

      if (selected) {
        const bounds = path.bounds(selected.feature);
        const [[x0, y0], [x1, y1]] = bounds;
        const dx = x1 - x0;
        const dy = y1 - y0;
        const cx = (x0 + x1) / 2;
        const cy = (y0 + y1) / 2;
        const scale = Math.max(
          1.6,
          Math.min(7, 0.82 / Math.max(dx / width, dy / height)),
        );
        const transform = d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(scale)
          .translate(-cx, -cy);

        root.transition().duration(320).call(zoom.transform, transform);
        return;
      }

      const point = pointByMapName.get(mapName);

      if (!point) {
        return;
      }

      const transform = d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(6)
        .translate(-point.x, -point.y);

      root.transition().duration(320).call(zoom.transform, transform);
    }

    function toggleSelection(mapName) {
      if (selectedMapName === mapName) {
        clearSelection();
        root.transition().duration(220).call(zoom.transform, d3.zoomIdentity);
        return;
      }

      clearSelection();

      const nextFeature = featureByMapName.get(mapName);
      const nextPoint = pointByMapName.get(mapName);
      const nextLegend = legendByMapName.get(mapName);

      if (nextFeature) {
        nextFeature.element.classed("map-country--selected", true).raise();
      }

      if (nextPoint) {
        nextPoint.element.classed("map-micro-country--selected", true).raise();
      }

      if (nextLegend) {
        nextLegend.classList.add("map-legend-item--active");
        nextLegend.setAttribute("aria-pressed", "true");
      }

      selectedMapName = mapName;
      focusCountry(mapName);
    }
  } catch (error) {
    console.error("Failed to render visited countries map.", error);
  }
});

function showTooltip(tooltip, country) {
  tooltip.innerHTML = `<strong>${escapeHtml(country.emoji)} ${escapeHtml(country.name)}</strong>`;
  tooltip.classList.add("is-visible");
  tooltip.setAttribute("aria-hidden", "false");
}

function hideTooltip(tooltip) {
  tooltip.classList.remove("is-visible");
  tooltip.setAttribute("aria-hidden", "true");
}

function positionTooltip(tooltip, clientX, clientY) {
  const offset = 16;
  const width = tooltip.offsetWidth;
  const height = tooltip.offsetHeight;
  const maxX = window.innerWidth - width - 12;
  const maxY = window.innerHeight - height - 12;
  const left = Math.min(clientX + offset, maxX);
  const top = Math.min(clientY + offset, maxY);

  tooltip.style.left = `${Math.max(12, left)}px`;
  tooltip.style.top = `${Math.max(12, top)}px`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
