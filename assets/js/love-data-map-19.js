$(document).ready(() => {
  ["html", "body", "#map"].forEach( node => {
    $(node).css("height", "100%")
      .css("width", "100%");
  });

  const maxZoom = 5;
  var OpenMapSurfer_Grayscale = L.tileLayer('https://korona.geog.uni-heidelberg.de/tiles/roadsg/x={x}&y={y}&z={z}', {
      maxZoom,
      attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  });
  const map = L.map("map", {
    center: [30, 0],
    zoom: 2,
    maxZoom
  });
  OpenMapSurfer_Grayscale.addTo(map);

  const loveDataUrl = "https://spreadsheets.google.com/feeds/cells/1tPuoRHSrEoU2aZFhZYN8B9TJ5NDUg-O40IMdF8nT4kM/1/public/full?alt=json";

  $.getJSON(loveDataUrl, data => {
    const countries = data.feed.entry
      .filter( entry => (parseInt(entry["gs$cell"].row) > 1 && entry["gs$cell"].col === "2")) 
      .map( entry => entry.content["$t"] )
      .filter( content => content !== "" )
      .reduce( (obj, item) => {
        obj[item] = (obj[item] || 0) + 1;
        return obj;
      }, {});
    const states = data.feed.entry
      .filter( entry => (parseInt(entry["gs$cell"].row) > 1 && entry["gs$cell"].col === "3")) 
      .map( entry => entry.content["$t"] )
      .filter( content => content !== "" )
      .reduce( (obj, item) => {
        obj[item] = (obj[item] || 0) + 1;
        return obj;
      }, {});
    console.log(countries);
    console.log(states);
    const max = Math.max(...[ Math.max(...Object.keys(countries).map(country => countries[country])), Math.max(...Object.keys(states).map(state => states[state])) ]);
    $.getJSON("./assets/data/world.geo.json", data => {
      const countriesGeoJson = {"type": "FeatureCollection"};
      countriesGeoJson["features"] = data.features.filter( feature => feature.properties.formal_en !== "United States of America" );
      L.geoJSON(countriesGeoJson, {
        style(feature) {
          if(countries[feature.properties.admin]){
            const color = d3.interpolateBlues(countries[feature.properties.admin] / max);
            return { color, fillColor: color };
          } else {
            return { fillOpacity: 0, opacity: 0 };
          }
        }
      }).addTo(map);
    });
    $.getJSON("./assets/data/us-states.geo.json", data => {
      console.log("states");
      console.log(data);
      L.geoJSON(data, {
        style(feature) {
          if(states[feature.properties.name]){
            const color = d3.interpolateBlues(states[feature.properties.name] / max);
            return { color, fillColor: color };
          } else {
            return { fillOpacity: 0, opacity: 0 };
          }
        }
      }).addTo(map);
    });
  });

});
