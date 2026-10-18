mapboxgl.accessToken = mapToken;

// Safe coordinates extraction with a fallback
const coordinates = (listing.geometry && listing.geometry.coordinates && listing.geometry.coordinates.length)
    ? listing.geometry.coordinates
    : [72.8777, 19.0760]; // Mumbai default fallback

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: coordinates,
    zoom: 9
});

// Fixed 'Marker' and 'offset' typos, and used backticks ` ` for HTML template
const marker = new mapboxgl.Marker({ color: "red" })
    .setLngLat(coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<h4>${listing.title}</h4><p>Exact Location provided after booking</p>`
        )
    )
    .addTo(map);

