// SET INITIAL VALUES
// US continental boundaries (*Reference: https://stackoverflow.com/questions/28117281/show-only-united-states-when-using-leaflet-js-and-osm)
// var maxBounds = [
//     [5.499550, -167.276413], //Southwest
//     [83.162102, -52.233040]  //Northeast
// ];


// CHOOSE COLOR FUNCTION (*Reference: https://leafletjs.com/examples/choropleth/)
function getColor(d) {
    return d > 90 ? '#FF1100' :
        d > 70 ? '#FF4B00' :
            d > 50 ? '#FF9500' :
                d > 30 ? '#FFC000' :
                    d > 10 ? '#FFFF00' :
                        d > -10 ? '#00F000' :
                            '#00FFFF';
}


// CREATE MAP FUNCTION
function createMap(earthquakes, plates) {

    // console.log("Creating map");   // DEBUG

    // TILE LAYERS (background mapS) 
    // Mapbox Satellite
    var satelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "satellite-v9",
        accessToken: API_KEY
    });

    // Mapbox Outdoors
    var outdoorsMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "outdoors-v11",
        accessToken: API_KEY
    });

    // Mapbox Light
    var lightMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "light-v10",
        accessToken: API_KEY
    });

    // Mapbox Dark
    var darkMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "dark-v10",
        accessToken: API_KEY
    });

    // Tile layers holder (baseMaps object)
    var baseMaps = {
        "Satellite": satelliteMap,
        "Outdoor": outdoorsMap,
        "Light": lightMap,
        "Dark": darkMap
    };


    // ADDITIONAL LAYERS
    // Additional layers holder (overlayMaps object)
    var overlayMaps = {
        "Earthquakes": earthquakes,
        "Tectonic Plates": plates
    }

    // Build map & Set parameters (map object)
    var myMap = L.map("map", {
        center: [25, -15],
        zoom: 3,
        layers: [lightMap, plates, earthquakes]
    });

    // Layer control
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap); // Add to map

    // console.log("Done!");   // DEBUG

    // CREATE LEGEND FUNCTION (*Reference: https://leafletjs.com/examples/choropleth/)
    // Pending: Improve code 
    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            grades = [-10, 10, 30, 50, 70, 90],
            labels = [];

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div;
    };

    console.log("Legend: ", legend);   // DEBUG
    
    legend.addTo(myMap);

    console.log("End of Script")

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
            fillColor: getColor(depth),
            fillOpacity: 0.75
        }).bindPopup(`<strong>Magnitude: ${magnitude}</strong><hr>Location: ${place}<br>Depth: ${depth} km`);

        earthquakeMarkers.push(earthquakeMarker);

        // console.log("Marker: ", earthquakeMarker);   // DEBUG
        magnitudeArr.push(magnitude);   // DEBUG
        depthArr.push(depth);   // DEBUG

    })

    

    var link = "static/data/boundaries.geojson";
    d3.json(link).then(function (data) {
        // Creating a GeoJSON layer with the retrieved data
        var plates = L.geoJson(data, {
            "color": "blue",
            "weight": 1,
            "opacity": .75
        });
    
        console.log("Tectonic plates: ", data);   // DEBUG
    
        createMap(L.layerGroup(earthquakeMarkers), plates);

    });
    
    // console.log("Markers: ", earthquakeMarkers);   // DEBUG
    console.log("Earthquake Magnitude [min/max]: ", Math.min(...magnitudeArr), Math.max(...magnitudeArr));   // DEBUG
    console.log("Earthquake Depth [min/max]: ", Math.min(...depthArr), Math.max(...depthArr));   // DEBUG
    // console.log("Done!");   // DEBUG

};


// UNITED STATES GEOLOGICAL SURVEY DATA 
// USGS GeoJSON Feed: "All Earthquakes" - Past 7 Days (updated every minute)
var usgsURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// USGS GeoJSON Feed: "M4.5+ Earthquakes" - Past 30 Days (updated every minute)
// var usgsURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson";

// Perform API call
d3.json(usgsURL).then(createMarkers);




/*
TECTONIC PLATES DATA:
    *Credit: Hugo Ahlenius, Nordpil & Peter Bird
    *Source: https://github.com/fraxen/tectonicplates
*/

// var link = "https://github.com/fraxen/tectonicplates/blob/master/GeoJSON/PB2002_plates.json";
// var link = "https://github.com/fraxen/tectonicplates/blob/master/GeoJSON/PB2002_boundaries.json";

