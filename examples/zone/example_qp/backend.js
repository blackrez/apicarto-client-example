(function() {
  OSM = L.tileLayer("http://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png", {
    attribution: '&copy; Openstreetmap France | &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  });
  mapId = "map_qp";

  map = L.map(mapId, {
    center: new L.LatLng(43.9494421840412, 4.881191253662109),
    zoom: 13,
    layers: [OSM]
  });
  window.map = map;
  baseMap = {
    "OpenStreetMap": OSM
  };
  $.ajax({
    url: 'http://apicarto.coremaps.com/api/v1/data/"+  +"/geojson',
    datatype: 'json',
    jsonCallback: 'getJson',
    success: loaddraw
  });
  
  L.control.layers(baseMap).addTo(map);

  function loaddraw(data) {
    $("#ref").append(data.properties.ref);
    var qpLayer = L.geoJson(data).addTo(map);
    
  };

  $('#getdraw').click(function() {
    var ref = $("#ref").val()
    $.ajax({
      url: 'http://apicarto.coremaps.com/api/v1/data/'+ ref +'/geojson',
      datatype: 'json',
      jsonCallback: 'getJson',
      success: loaddraw
    });
  });

}).call(this);
