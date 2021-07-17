// ::::::::::::::::::::::::::::::
// DATA SOURCES
// ::::::::::::::::::::::::::::::

// UNITED STATES GEOLOGICAL SURVEY DATA
// * USGS GeoJSON Feed: "All Earthquakes"
// * Past 7 Days (updated every minute)
var usgsURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// TECTONIC PLATES DATA
// * Credit: Hugo Ahlenius, Nordpil & Peter Bird
// * Source: https://github.com/fraxen/tectonicplates
var platesGeoJSON = "static/data/boundaries.geojson";

// ::::::::::::::::::::::::::::::
// FUNCTIONS
// ::::::::::::::::::::::::::::::

// CHOOSE COLOR FUNCTION
// *Source: https://leafletjs.com/examples/choropleth/
function getColor(d) {
    return d > 90 ? '#FF1100' :
        d > 70 ? '#FF4B00' :
            d > 50 ? '#FF9500' :
                d > 30 ? '#FFC000' :
                    d > 10 ? '#FFFF00' :
                        d > -10 ? '#00F000' :
                            '#00FFFF';
}


// INFO LEGEND FUNCTION
// *Reference: https://leafletjs.com/examples/choropleth/
function infoLegend(myMap) {

    var legend = L.control({ position: 'bottomright' });
    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            grades = [-10, 10, 30, 50, 70, 90],
            labels = [];

        // Loop through density intervals and generate label with colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div;
    };

    legend.addTo(myMap);

}

// CONTACT LEGEND FUNCTION
function contactLegend(myMap) {
    var legend = L.control({ position: 'bottomleft' });
    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'contact');
        div.innerHTML += '<div><strong>Data Source: <a href="https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php">USGS</a><br>Contact: <a href="mailto:rperezme.data@gmail.com">rperezme.data@gmail.com</a></strong></div>';
        return div;
    };
    legend.addTo(myMap);
}


// CREATE MAP FUNCTION
function createMap(earthquakes, plates) {

    // TILE LAYERS (background maps) 
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

    // CREATE MAP (map object)
    var myMap = L.map("map-id", {
        center: [21, -100],
        zoom: 3,
        layers: [lightMap, plates, earthquakes]
    });

    // LAYER CONTROL
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap); // Add to map

    // LEGENDS
    infoLegend(myMap);
    contactLegend(myMap);

    console.log("End of Script")   // DEBUG

}


// CREATE MARKERS FUNCTION (Earthquakes layer)
function createMarkers(response) {

    // Get features from geoJSON response
    var features = response.features;

    // Prompt earthquake count
    console.log("Earthquake Count: ", response.metadata.count);   // DEBUG

    // Define markers array
    var earthquakeMarkers = [];
    var magnitudeArr = [];   // DEBUG
    var depthArr = [];   // DEBUG

    // Get earthquake data
    // Pending: Change to onEachFeature
    features.forEach((feature) => {
        var magnitude = feature.properties.mag;
        var place = feature.properties.place;
        var timestamp = new Date(feature.properties.time).toUTCString();
        var location = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
        var depth = feature.geometry.coordinates[2];

        // Build earthquake marker
        var earthquakeMarker = L.circleMarker(location, {
            radius: magnitude * 3.5,
            stroke: true,
            color: "black",
            weight: 1,
            fillColor: getColor(depth),
            fillOpacity: 0.75
        }).bindPopup(`
            <strong>Magnitude: ${magnitude}</strong><hr>
            <strong>&#x2022 Location: </strong>${place}<br>
            <strong>&#x2022 UTC: </strong>${timestamp}<br>
            <strong>&#x2022 Depth: </strong>${depth} km
        `);

        // Append to arrays
        earthquakeMarkers.push(earthquakeMarker);
        magnitudeArr.push(magnitude);   // DEBUG
        depthArr.push(depth);   // DEBUG

    })

    var earthquakes = L.layerGroup(earthquakeMarkers);
    createPlates(earthquakes);

    // Prompt earthquake summary
    console.log("Earthquake Magnitude [min/max]: ", Math.min(...magnitudeArr), Math.max(...magnitudeArr));   // DEBUG
    console.log("Earthquake Depth [min/max]: ", Math.min(...depthArr), Math.max(...depthArr));   // DEBUG

}


// CREATES PLATES FUNCTION (Plates layer)
function createPlates(earthquakes) {

    d3.json(platesGeoJSON).then(function (boundaries) {
        // Creating a GeoJSON layer with the retrieved data
        var plates = L.geoJson(boundaries, {
            "color": '#0000FF',   // "blue"
            "weight": 1,
            "opacity": .75
        });

        createMap(earthquakes, plates);

    });
}


// ::::::::::::::::::::::::::::::
// SCRIPT
// ::::::::::::::::::::::::::::::

// Perform initial API call
d3.json(usgsURL).then(createMarkers);
