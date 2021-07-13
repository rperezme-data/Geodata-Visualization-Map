// SET INITIAL VALUES
// US continental boundaries (*Reference: https://stackoverflow.com/questions/28117281/show-only-united-states-when-using-leaflet-js-and-osm)
// var maxBounds = [
//     [5.499550, -167.276413], //Southwest
//     [83.162102, -52.233040]  //Northeast
// ];


// CREATE MAP FUNCTION
function createMap(earthquakes) {

    // console.log("Creating map");   // DEBUG

    // Tile layer (background map)
    var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "light-v10",
        accessToken: API_KEY
    });
    
    // Tile layers holder (baseMaps object)
    var baseMaps = {
        "Light Map": lightmap
    };

    // Additional layers holder (overlayMaps object)
    var overlayMaps = {
        "Earthquakes": earthquakes
    }

    // Build map & Set parameters (map object)
    var myMap = L.map("map", {
        center: [25, -25],
        zoom: 2.5,
        layers: [lightmap, earthquakes]
    });

    // Layer control
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap); // Add to map

    // console.log("Done!");   // DEBUG

}


// CREATE MARKERS FUNCTION
function createMarkers(response) {

    // console.log("Creating markers");   // DEBUG

    // Get Features from geoJSON response
    var earthquakes = response.features;
    console.log("Earthquake Count: ", response.metadata.count);   // DEBUG
    // console.log("Response: ", earthquakes);   // DEBUG

    // Define markers array
    var earthquakeMarkers = [];
    var magnitudeArr = [];   // DEBUG
    var depthArr = [];   // DEBUG

    // Get earthquake data
    earthquakes.forEach((earthquake) => {
        var magnitude = earthquake.properties.mag;
        var place = earthquake.properties.place;
        var location = [earthquake.geometry.coordinates[1], earthquake.geometry.coordinates[0]];
        var depth = earthquake.geometry.coordinates[2];

        // console.log("Place: ", place);   // DEBUG
        // console.log("Magnitude: ", magnitude);   // DEBUG
        // console.log("Location: ", location);   // DEBUG
        // console.log("Depth: ", depth);   // DEBUG

        // Build earthquake marker
        var earthquakeMarker = L.circleMarker(location, {
            radius: magnitude * 3,
        // var earthquakeMarker = L.circle(location, {
            // radius: magnitude * 2* 10000,
            stroke: true,
            color: "black",
            weight: 1,
            fillColor: "yellow",
            fillOpacity: 0.5
        }).bindPopup(`<strong>Magnitude: ${magnitude}</strong><hr>Location: ${place}<br>Depth: ${depth} km`);

        earthquakeMarkers.push(earthquakeMarker);
        
        // console.log("Marker: ", earthquakeMarker);   // DEBUG
        magnitudeArr.push(magnitude);   // DEBUG
        depthArr.push(depth);   // DEBUG

    })

    createMap(L.layerGroup(earthquakeMarkers));

    // console.log("Markers: ", earthquakeMarkers);   // DEBUG
    console.log("Earthquake Magnitude [min/max]: ", Math.min(...magnitudeArr), Math.max(...magnitudeArr));   // DEBUG
    console.log("Earthquake Depth [min/max]: ", Math.min(...depthArr), Math.max(...depthArr));   // DEBUG
    // console.log("Done!");   // DEBUG

}

// USGS GeoJSON Feed: "All Earthquakes" - Past 7 Days (updated every minute)
var usgsURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// USGS GeoJSON Feed: "M4.5+ Earthquakes" - Past 30 Days (updated every minute)
// var usgsURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson";

// Perform API call
d3.json(usgsURL).then(createMarkers);

