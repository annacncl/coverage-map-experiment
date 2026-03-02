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

  // 👇 ADD THIS PART
  map.on("click", "org-pins", (e) => {

    const feature = e.features[0];

    const coordinates = feature.geometry.coordinates.slice();
    const name = feature.properties.name;

    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(`<strong>${name}</strong>`)
      .addTo(map);

  });

});
