slider = document.querySelector('#slider');
sliderValue = document.querySelector('#slider-value');
mapObject = document.querySelector('#map');

const years = [
  { "value": "world_bc123000", "label": "۱۲۳۰۰۰ پیش از میلاد" },
  { "value": "world_bc10000", "label": "۱۰۰۰۰ پیش از میلاد" },
  { "value": "world_bc5000", "label": "۵۰۰۰ پیش از میلاد" },
  { "value": "world_bc4000", "label": "۴۰۰۰ پیش از میلاد" },
  { "value": "world_bc3000", "label": "۳۰۰۰ پیش از میلاد" },
  { "value": "world_bc2000", "label": "۲۰۰۰ پیش از میلاد" },
  { "value": "world_bc1500", "label": "۱۵۰۰ پیش از میلاد" },
  { "value": "world_bc1000", "label": "۱۰۰۰ پیش از میلاد" },
  { "value": "world_bc700", "label": "۷۰۰ پیش از میلاد" },
  { "value": "world_bc500", "label": "۵۰۰ پیش از میلاد" },
  { "value": "world_bc400", "label": "۴۰۰ پیش از میلاد" },
  { "value": "world_bc323", "label": "۳۲۳ پیش از میلاد" },
  { "value": "world_bc300", "label": "۳۰۰ پیش از میلاد" },
  { "value": "world_bc200", "label": "۲۰۰ پیش از میلاد" },
  { "value": "world_bc100", "label": "۱۰۰ پیش از میلاد" },
  { "value": "world_bc1", "label": "۱ پیش از میلاد" },
  { "value": "world_100", "label": "۱۰۰ میلادی" },
  { "value": "world_200", "label": "۲۰۰ میلادی" },
  { "value": "world_300", "label": "۳۰۰ میلادی" },
  { "value": "world_400", "label": "۴۰۰ میلادی" },
  { "value": "world_500", "label": "۵۰۰ میلادی" },
  { "value": "world_600", "label": "۶۰۰ میلادی" },
  { "value": "world_700", "label": "۷۰۰ میلادی" },
  { "value": "world_800", "label": "۸۰۰ میلادی" },
  { "value": "world_900", "label": "۹۰۰ میلادی" },
  { "value": "world_1000", "label": "۱۰۰۰ میلادی" },
  { "value": "world_1100", "label": "۱۱۰۰ میلادی" },
  { "value": "world_1200", "label": "۱۲۰۰ میلادی" },
  { "value": "world_1279", "label": "۱۲۷۹ میلادی" },
  { "value": "world_1300", "label": "۱۳۰۰ میلادی" },
  { "value": "world_1400", "label": "۱۴۰۰ میلادی" },
  { "value": "world_1492", "label": "۱۴۹۲ میلادی" },
  { "value": "world_1500", "label": "۱۵۰۰ میلادی" },
  { "value": "world_1530", "label": "۱۵۳۰ میلادی" },
  { "value": "world_1600", "label": "۱۶۰۰ میلادی" },
  { "value": "world_1650", "label": "۱۶۵۰ میلادی" },
  { "value": "world_1700", "label": "۱۷۰۰ میلادی" },
  { "value": "world_1715", "label": "۱۷۱۵ میلادی" },
  { "value": "world_1783", "label": "۱۷۸۳ میلادی" },
  { "value": "world_1800", "label": "۱۸۰۰ میلادی" },
  { "value": "world_1815", "label": "۱۸۱۵ میلادی" },
  { "value": "world_1880", "label": "۱۸۸۰ میلادی" },
  { "value": "world_1900", "label": "۱۹۰۰ میلادی" },
  { "value": "world_1914", "label": "۱۹۱۴ میلادی" },
  { "value": "world_1920", "label": "۱۹۲۰ میلادی" },
  { "value": "world_1930", "label": "۱۹۳۰ میلادی" },
  { "value": "world_1938", "label": "۱۹۳۸ میلادی" },
  { "value": "world_1945", "label": "۱۹۴۵ میلادی" },
  { "value": "world_1960", "label": "۱۹۶۰ میلادی" },
  { "value": "world_1994", "label": "۱۹۹۴ میلادی" },
  { "value": "world_2000", "label": "۲۰۰۰ میلادی" },
  { "value": "world_2010", "label": "۲۰۱۰ میلادی" },
];

slider.max = years.length;
slider.value = years.length;
slider.oninput = function () {
  drawMap();
}

drawMap();

function drawMap() {
  sliderValue.innerHTML = years[slider.value - 1].label;
  const year = years[slider.value - 1].value;
  geojsonUrl = `https://storage.marznegar.ir/maps/${year}.geojson`;

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

  L.tileLayer('https://storage.marznegar.ir/tiles/{z}/{x}/{y}.png', { maxZoom: 7, attribution: '<a href="https://github.com/aourednik/historical-basemaps">Historical Basemaps</a>' }).addTo(map);
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
