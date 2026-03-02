mapboxgl.accessToken =
  "pk.eyJ1IjoiYW5uYWNvcm4iLCJhIjoiY21oZzR0d2N1MGJrZzJrczd3YzQ5dTd2eCJ9.jy4VcpJX5fWUqTo-Pr6oZA";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/light-v11",
  center: [-71.1, 42.36],
  zoom: 5
});

map.on("load", async () => {
  // ----------------------------
  // 1) ORG PINS (from GeoJSON file in repo)
  // ----------------------------
  map.addSource("orgs", {
    type: "geojson",
    data: "./data/orgs.geojson"
  });

  map.addLayer({
    id: "org-pins",
    type: "circle",
    source: "orgs",
    paint: {
      "circle-radius": 6,
      "circle-color": "#2c7be5",
      "circle-stroke-width": 1,
      "circle-stroke-color": "#ffffff"
    }
  });

  // (optional) Popup on click — does NOT change coverage in intensity mode
  map.on("click", "org-pins", (e) => {
    const feature = e.features[0];
    const coordinates = feature.geometry.coordinates.slice();
    const name = feature.properties.name;
    const orgId = feature.properties.org_id;

    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(`<strong>${name}</strong><br/><small>${orgId}</small>`)
      .addTo(map);
  });

  map.on("mouseenter", "org-pins", () => (map.getCanvas().style.cursor = "pointer"));
  map.on("mouseleave", "org-pins", () => (map.getCanvas().style.cursor = ""));

  // ----------------------------
  // 2) BOUNDARY TILESETS (your Mapbox uploads)
  // ----------------------------
  map.addSource("counties", {
    type: "vector",
    url: "mapbox://annacorn.7573wevu"
  });

  map.addLayer({
  id: "counties-debug-outline",
  type: "line",
  source: "counties",
  "source-layer": "counties-ne-7yxrvw",
  paint: {
    "line-color": "rgba(255,0,0,0.6)",
    "line-width": 0.5
  }
});

  map.addSource("states", {
    type: "vector",
    url: "mapbox://annacorn.43if3v19"
  });

  // A faint states layer (optional context)
  map.addLayer({
    id: "states-outline",
    type: "line",
    source: "states",
    "source-layer": "states-us-3gb7tm",
    paint: {
      "line-color": "rgba(0,0,0,0.20)",
      "line-width": 1
    }
  });

  // ----------------------------
  // 3) INTENSITY COUNTS (compute how many orgs per county)
  // ----------------------------
  const countsByCounty = {};
  Object.values(window.orgCoverage || {}).forEach((cov) => {
    (cov.countyIds || []).forEach((geoid) => {
      const k = String(geoid);
      countsByCounty[k] = (countsByCounty[k] || 0) + 1;
    });
  });

  // ----------------------------
  // 4) RELIABLE PROTOTYPE METHOD:
  //    Build a GeoJSON of ONLY the covered counties by querying the vector tiles
  //    and attaching "count" as a property.
  //
  //    This avoids needing feature IDs for feature-state.
  // ----------------------------
  // Query all county features currently loaded in view and collect geometry.
  // We then keep updating once after we fit bounds to a national-ish view.
  // For a prototype with a small org set, this is totally fine.

map.jumpTo({ center: [-98, 39], zoom: 3 });

// Wait until all tiles/layers are fully loaded
await new Promise((resolve) => {
  map.once("idle", resolve);
});

// Now query loaded county features
const features = map.querySourceFeatures("counties", {
  sourceLayer: "counties-ne-7yxrvw"
});

console.log("Loaded county features:", features.length);

  // Build GeoJSON from just the counties that appear in countsByCounty
  const covered = [];
  for (const f of features) {
    const geoid = String(f.properties.GEOID);
    const count = countsByCounty[geoid];
    if (!count) continue;

    // f.toJSON() gives GeoJSON-like feature; ensure properties include count
    const gj = f.toJSON();
    gj.properties = { ...gj.properties, count };
    covered.push(gj);
  }

  map.addSource("county-intensity-geojson", {
    type: "geojson",
    data: { type: "FeatureCollection", features: covered }
  });

  // Draw intensity shading (darker when count higher)
  map.addLayer(
    {
      id: "county-intensity-fill",
      type: "fill",
      source: "county-intensity-geojson",
      paint: {
        "fill-color": [
          "interpolate",
          ["linear"],
          ["get", "count"],
          1,
          "rgba(0,0,0,0.08)",
          2,
          "rgba(0,0,0,0.14)",
          4,
          "rgba(0,0,0,0.22)",
          8,
          "rgba(0,0,0,0.32)"
        ]
      }
    },
    "org-pins" // place below pins
  );

  // Optional outline for covered counties
  map.addLayer(
    {
      id: "county-intensity-outline",
      type: "line",
      source: "county-intensity-geojson",
      paint: {
        "line-color": "rgba(0,0,0,0.18)",
        "line-width": 1
      }
    },
    "org-pins"
  );
});
