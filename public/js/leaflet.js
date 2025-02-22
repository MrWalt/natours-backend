export function displayMap(locations) {
  const map = L.map("map", {
    zoomControl: false,
    dragging: false,
  }).setView([34.111745, -118.113491], 13);
  L.tileLayer(
    "https://tile.jawg.io/19b057b6-6f75-4713-af58-82b4c876ceda/{z}/{x}/{y}{r}.png?access-token=wFZpRipnqvZjwNgeYkOHqbBbkx595GQYKjvlFvtsvJAeRGc2MRMF8Qu6jFC3Qk1s",
    {}
  ).addTo(map);

  map.attributionControl.addAttribution(
    '<a href="https://www.jawg.io?utm_medium=map&utm_source=attribution" target="_blank">&copy; Jawg</a> - <a href="https://www.openstreetmap.org?utm_medium=map-attribution&utm_source=jawg" target="_blank">&copy; OpenStreetMap</a>&nbsp;contributors'
  );

  const greenIcon = L.icon({
    iconUrl: "/img/pin.png",
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [-1, -32],
  });

  const points = [];
  locations.forEach((loc) => {
    points.push([loc.coordinates[1], loc.coordinates[0]]);
    L.marker([loc.coordinates[1], loc.coordinates[0]], { icon: greenIcon })
      .addTo(map)
      .bindPopup(
        `<p class="map-popup">Day ${loc.day}: ${loc.description}</p>`,
        {
          autoClose: false,
        }
      )
      .openPopup();
  });

  const bounds = L.latLngBounds(points).pad(0.5);
  map.fitBounds(bounds);

  map.scrollWheelZoom.disable();
}
