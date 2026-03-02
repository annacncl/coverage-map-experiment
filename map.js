mapboxgl.accessToken = "pk.eyJ1IjoiYW5uYWNvcm4iLCJhIjoiY21oZzR0d2N1MGJrZzJrczd3YzQ5dTd2eCJ9.jy4VcpJX5fWUqTo-Pr6oZA";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/light-v11",
  center: [-71.1, 42.36],
  zoom: 5
});

map.on("load", () => {

  // load org locations
  map.addSource("orgs", {
    type: "geojson",
    data: "./data/orgs.geojson"
  });

  // draw org pins
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

  // ✅ ADD THESE SOURCES (replace tileset URLs)
  map.addSource("counties", {
    type: "vector",
    url: "mapbox://annacorn.7573wevu"
  });

  map.addSource("states", {
    type: "vector",
    url: "mapbox://annacorn.43if3v19"
  });

  // ✅ ADD THESE LAYERS (replace source-layer names)
  map.addLayer({
    id: "counties-coverage-fill",
    type: "fill",
    source: "counties",
    "source-layer": "counties-ne-7yxrvw",
    paint: {
      "fill-color": "#000",
      "fill-opacity": 0.12
    },
    filter: ["in", ["get", "GEOID"], ["literal", []]]
  });

  map.addLayer({
    id: "states-coverage-fill",
    type: "fill",
    source: "states",
    "source-layer": "states-us-3gb7tm",
    paint: {
      "fill-color": "#000",
      "fill-opacity": 0.08
    },
    filter: ["in", ["get", "STATEFP"], ["literal", []]]
  });

  // click handler (still just popup + console log for now)
  map.on("click", "org-pins", (e) => {
    const feature = e.features[0];

const orgId = feature.properties.org_id;
const coverage = window.orgCoverage[orgId];

console.log("clicked org:", orgId, coverage);

// highlight counties
map.setFilter(
  "counties-coverage-fill",
  ["in", ["get", "GEOID"], ["literal", coverage.countyIds]]
);

// highlight states
map.setFilter(
  "states-coverage-fill",
  ["in", ["get", "STATEFP"], ["literal", coverage.stateIds]]
);

    const coordinates = feature.geometry.coordinates.slice();
    const name = feature.properties.name;

    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(`<strong>${name}</strong>`)
      .addTo(map);
  });

});
