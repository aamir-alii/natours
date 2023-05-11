export const displayMap = (locations) => {
  const accessToken =
    'pk.eyJ1IjoiYWFtaXItYWxpaSIsImEiOiJjbGV2NW56c2kwbDNsM3Zta2phNWdwdmtpIn0.LyRZee2QYWLzhZ1N17cT0g';
  mapboxgl.accessToken = accessToken;
  const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/aamir-alii/clev683lt000d01mhwiuudn6u', // style URL
    //   scrollZoom: false,
    //   center: [-118.113491, 34.111745], // starting position [lng, lat]
    //   zoom: 4, // starting zoom
    //   interactive: false,
  });
  map.scrollZoom.disable();
  const bounds = new mapboxgl.LngLatBounds();
  locations.forEach((loc) => {
    // create marker
    const el = document.createElement('div');
    el.className = 'marker';
    //   add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);
    // add popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 200,
      left: 100,
      right: 100,
    },
  });
};
