dateSelector = document.querySelector('#date-selector');
mapObject = document.querySelector('#map');

dateSelector.onchange = () => {
    drawMap();
}
drawMap();

function drawMap() {
    year = dateSelector.value;
    geojsonUrl = `https://storage.tabestan.ir/maps/${year}.geojson`;

    mapObject.remove();
    mapObject = document.createElement('div');
    mapObject.setAttribute("id", "map");
    document.querySelector(".map-container").append(mapObject);

    const map = L.map('map').setView([32.00, 53.00], 4);
    map.createPane('polygons');
    map.on('popupopen', function (e) {
        fetchDataFromWikipedia(e.popup);
    });

    polygons = map.getPane('polygons');
    polygons.style.zIndex = 401;
    polygons.style['mix-blend-mode'] = 'normal';
    const colors = d3.scaleOrdinal(d3.schemePaired);

    L.tileLayer('https://storage.tabestan.ir/tiles/{z}/{x}/{y}.png', { maxZoom: 7, attribution: '<a href="https://github.com/aourednik/historical-basemaps">Historical Basemaps</a>' }).addTo(map);
    d3.json(geojsonUrl)
        .then(function (data, error) {
            updateMap(data);
        });

    function updateMap(data) {
        let categories = [...new Set(data.features.map(d => d.properties.SUBJECTO || d.properties.NAME))];

        for (let i = categories.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [categories[i], categories[j]] = [categories[j], categories[i]];
        }

        new L.geoJson(data, {
            pane: 'polygons',
            onEachFeature: featureInfo,
            style: featureStyle,
        }).addTo(map);

        function featureStyle(feature) {
            let name = feature.properties.SUBJECTO || feature.properties.NAME;
            return {
                pane: 'polygons',
                opacity: 0,
                color: 'white',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 1.0,
                filter: 'ulr(#blur)',
                fill: true,
                fillOpacity: 0.5,
                fillColor: d3.interpolateWarm(categories.indexOf(name) / categories.length),
            }
        }
        function featureInfo(feature, layer) {
            if (feature.properties.NAME || feature.properties.SUBJECTO) {
                var popupContent = feature.properties.NAME || feature.properties.SUBJECTO || "";
                var popup = L.popup({ maxHeight: 225 }).setContent(popupContent);
                layer.bindPopup(popup);
            }
        }
    }

    function fetchDataFromWikipedia(popup) {
        const baseURL = "https://fa.wikipedia.org/w/api.php?format=json&action=query&redirects=1";
        if (popup.getContent().match(/[a-zA-Z]/)) {
            return; // Not translated
        }
        d3.json(`${baseURL}&list=search&srsearch=${popup.getContent()}&srlimit=50&origin=*`)
            .then(function (data, error) {
                if (data.query.search.length > 0) {
                    const pageId = data.query.search[0].pageid;
                    d3.json(`${baseURL}&pageids=${pageId}&explaintext=1&exintro=1&prop=extracts&origin=*`)
                        .then(function (data, error) {
                            popup.setContent(data.query.pages[pageId].extract);
                        });
                }
            });
    }
}