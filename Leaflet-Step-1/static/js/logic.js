// SET INITIAL VALUES
// US continental boundaries (*Reference: https://stackoverflow.com/questions/28117281/show-only-united-states-when-using-leaflet-js-and-osm)
// var maxBounds = [
//     [5.499550, -167.276413], //Southwest
//     [83.162102, -52.233040]  //Northeast
// ];


// CREATE MAP FUNCTION
function createMap(earthquakes) {

    console.log("Creating map");   // DEBUG

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

    console.log("Done!");   // DEBUG

}



