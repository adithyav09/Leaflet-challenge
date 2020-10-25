// Store API link
var geojsonData = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

//Enlarging the marker size in order to be visible.
function markerSize(magnitude) {
    return magnitude * 25000;
}

//Creating the magnitude scaling by color based of ritcher scale.
function getColor(magnitude) {
    if (magnitude <= 1) {
        return "#ADFF2F";
    } else if (magnitude <= 3) {
        return "#9ACD32";
    } else if (magnitude <= 5) {
        return "#FFFF00";
    } else if (magnitude <= 7) {
        return "#ffd700";
    } else if (magnitude <= 9) {
        return "#FFA500";
    } else {
        return "#FF0000";
    };
}

// Use D3 Json in order to select the features within the URL and pass through createFeatures function.
d3.json(geojsonData, function(data) {
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {

    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: function(feature, layer) {

            layer.bindPopup("<h3>" + feature.properties.place +
                "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" + "<p> Mag: " + feature.properties.mag + "</p>")
        },
        pointToLayer: function(feature, latlng) {
            return new L.circle(latlng, {
                radius: markerSize(feature.properties.mag),
                fillColor: getColor(feature.properties.mag),
                fillOpacity: 1,
                stroke: false,
            })
        }
    });

    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
}

function createMap(earthquakes) {

    // Satelite Map
    var satelitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 19,
        id: "mapbox.satellite",
        accessToken: API_KEY
    });

    // Gray Scale Map
    var grayscalemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 19,
        id: "light-v9",
        accessToken: API_KEY
    });

    // Out Doors Map
    var outdoormap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // Base Map Layers in order to toggle through in Control Layer Icon.
    var baseMaps = {
        "Satelite Map": satelitemap,
        "Grayscale": grayscalemap,
        "Outdoors": outdoormap
    };

    // Create overlay object to hold our overlay layer.
    var overlayMaps = {
        Earthquakes: earthquakes
    };

    // Default Satelite Layer to be loaded when opened.
    var myMap = L.map("mapid", {
        center: [31.57853542647338, -99.580078125],
        zoom: 3,
        layers: [satelitemap, earthquakes]
    });

    // Control Layer in order to help designate which viewing options to choose.
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    //Add Legend in order to depict the magnitude color scale.
    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function() {

        var div = L.DomUtil.create('div', 'info legend'),
            magnitudes = [1, 3, 5, 7, 9];

        for (var i = 0; i < magnitudes.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(magnitudes[i] + 1) + '"></i> ' +
                magnitudes[i] + (magnitudes[i + 1] ? ' - ' + magnitudes[i + 1] + '<br>' : ' + ');
        }

        return div;
    };

    legend.addTo(myMap);
}