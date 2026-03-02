mapboxgl.accessToken = "pk.eyJ1IjoiYW5uYWNvcm4iLCJhIjoiY21oZzR0d2N1MGJrZzJrczd3YzQ5dTd2eCJ9.jy4VcpJX5fWUqTo-Pr6oZA";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/light-v11",
  center: [-71.1, 42.36], // Boston
  zoom: 5
});

map.on("load", () => {
  console.log("Map loaded successfully");
});
