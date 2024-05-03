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

        let layer = new L.geoJson(data, {
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
            if (feature.properties.SUBJECTO || feature.properties.NAME) {
                var popupContent = `<p>${feature.properties.SUBJECTO || feature.properties.NAME || ""}</p>`;
                layer.bindPopup(popupContent);
            }
        }
    }
}