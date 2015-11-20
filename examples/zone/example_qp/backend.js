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

  L.control.layers(baseMap).addTo(map);

  function loaddraw(data) {
    var qpLayer = L.geoJson(data).addTo(map);
    map.fitBounds(qpLayer.getBounds());

  };

  $('#getdraw').click(function() {
    var ref = $("#ref").val()
    $.ajax({
      headers: { 'AUTHORIZATION': 'Token 809cbcc744cdc86e678486e2e23f841e0d6d1c11' },
      url: 'http://apicarto.coremaps.com/store/api/v2/datastore/detail/'+ ref,
      datatype: 'json',
      jsonCallback: 'getJson',
      success: loaddraw
    });
  });

}).call(this);
