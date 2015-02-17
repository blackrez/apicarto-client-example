$ -> 
  # Your IGN Géoportail Api Key

  # The id of map container ex <div id="map"></div>
  mapId = "map"

  layers = new Array

  # OpenStreet Map Layer
  OSM = L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png",
    attribution: "&copy; <a href=\"http://osm.org/copyright\">OpenStreetMap</a>"
  )

  #   # IGN Topo Scan Express Standard
  scanWmtsUrl = 'http://gpp3-wxs.ign.fr/'+ignApiKey+'/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image%2Fjpeg'
  console.log(scanWmtsUrl)
  SCAN25 = L.tileLayer(scanWmtsUrl,
    attribution: "&copy; <a href=\"http://www.ign.fr/\">IGN</a>"
  )
    #   # IGN Cadastre
  cadWmtsUrl = 'http://gpp3-wxs.ign.fr/'+ignApiKey+'/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=CADASTRALPARCELS.PARCELS&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image%2Fjpeg'
  console.log(cadWmtsUrl)
  cad = L.tileLayer(cadWmtsUrl,
    attribution: "&copy; <a href=\"http://www.ign.fr/\">IGN</a>"
  )
  # IGN Topo
  # var ignWmtsUrl = "http://gpp3-wxs.ign.fr/"+ ignApiKey + "/wmts?LAYER=GEOGRAPHICALGRIDSYSTEMS.MAPS&EXCEPTIONS=text/xml&FORMAT=image/jpeg&SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&STYLE=normal&TILEMATRIXSET=PM&&TILEMATRIX={z}&TILECOL={x}&TILEROW={y}" ;
  map = L.map(mapId,
     center: new L.LatLng(47.72131112483761, -0.0350189208984375)
     zoom: 13
     layers: [OSM]
  )
  window.map = map
  baseMap =
    "Ign Topo Express": SCAN25
    OpenStreetMap: OSM
    #Ign Cadastre": cad

  L.control.layers(baseMap).addTo map
  LeafIcon = L.Icon.extend(options:
    shadowUrl: "http://leafletjs.com/docs/images/leaf-shadow.png"
    iconSize: [
      38
      95
    ]
    shadowSize: [
      50
      64
    ]
    iconAnchor: [
      22
      94
    ]
    shadowAnchor: [
      4
      62
    ]
    popupAnchor: [
      -3
      -76
    ]
  )
  greenIcon = new LeafIcon(iconUrl: "http://leafletjs.com/docs/images/leaf-green.png")
  drawnItems = new L.FeatureGroup()
  map.addLayer drawnItems
  drawControl = new L.Control.Draw(
    position: "topright"
    draw:
      polygon:
        shapeOptions:
          color: "purple"
        allowIntersection: false
        drawError:
          color: "orange"
          timeout: 1000
        showArea: true
        metric: true
        repeatMode: false
      marker: false
      polyline: false
      rectangle: false
      circle: false
    edit:
      featureGroup: drawnItems
  )
  map.addControl drawControl
  #map.on "draw:created", (e) ->
  #  type = e.layerType
  #  layer = e.layer
  #  layer.bindPopup "A popup!"  if type is "marker"
  #  drawnItems.addLayer layer
  #  return

  # onMapClick = (e) ->
  #   console.log e
  #   console.log e.latlng
  #   $.getJSON "/qcadastre",
  #     lat: e.latlng.lat
  #     lng: e.latlng.lng, 
  #     (geojsonFeature) -> 
  #       console.log geojsonFeature
  #       console.log map
  #       map.removeLayer(geojsonFeature)
  #       prop = geojsonFeature.features[0].properties
  #       $('#parcelle-info').html('<h2>Information parcelle</h2>Commune: ' + prop.commune + '<br/>info cadastre : ' + prop.section + ' ' + prop.feuille + ' ' +prop.numero);
  #       layer = L.geoJson(geojsonFeature).addTo(map)
  #       return
  #   return
  # map.on "click", onMapClick

  map.on "draw:created", (e) ->
    layer = e.layer
    window.data = e.layer
    # Do marker specific 'actions  
    # Do whatever else you need to. (save to db, add to map etc)
    map.addLayer layer
    window.data = layer.toGeoJSON()
    return
  
  
  $('#storedraw').click ->
  #  data = simplifyLatLngs(currentPolygon.getLatLngs());
    $.post("http://localhost:3000/api/v1/datastore",
      contentType: "application/json",
      dataType: 'json',
      geom: JSON.stringify(window.data)
    ).done (data) ->
      console.log data
      $('#parcelle-info').html('<span>Références pour récupérer le fichier : '+ data.reference + '</span>')
      return
  return
