$ -> 
  #local
  L.drawLocal.draw.toolbar.buttons.polygon = 'Dessiner un polygone'
  L.drawLocal.draw.toolbar.actions.title = "Annule le dessin en cours"
  L.drawLocal.draw.toolbar.actions.text = "Annuler"
  L.drawLocal.draw.toolbar.undo.text = "Supprimer le dernier point"
  L.drawLocal.draw.toolbar.undo.title = "Supprime le dernier point dessiné"
  L.drawLocal.draw.handlers.polygon.tooltip.start = "Cliquer pour commencer le dessin"
  L.drawLocal.draw.handlers.polygon.tooltip.cont = "Cliquer pour continuer le dessin"
  L.drawLocal.draw.handlers.polygon.tooltip.end = "Cliquer sur le premier point pour finaliser votre dessin"
  L.drawLocal.edit.toolbar.actions.save.title = "Valide les modifications"
  L.drawLocal.edit.toolbar.actions.save.text = "Valider les modifications"
  L.drawLocal.edit.toolbar.actions.cancel.title = "Annule les modifications"
  L.drawLocal.edit.toolbar.actions.cancel.text = "Annuler les modifications"
  L.drawLocal.edit.handlers.edit.tooltip.text = "Déplacer les points pour éditer le dessin"
  L.drawLocal.edit.handlers.edit.tooltip.subtext = "Cliquer sur 'annuler' pour annuler les changements"
  L.drawLocal.edit.toolbar.buttons.edit = "Édition du dessin"
  L.drawLocal.edit.toolbar.buttons.editDisabled = "Aucun dessin à éditer"
  L.drawLocal.edit.toolbar.buttons.removeDisabled = "Aucun dessin à supprimer"
  L.drawLocal.edit.toolbar.buttons.remove = "Supprimer le dessin"
  L.drawLocal.edit.handlers.remove.tooltip.text = "Cliquer sur le dessin pour le supprimer"
  L.drawLocal.edit.handlers.remove.tooltip.subtext = "Cliquer sur 'annuler' pour annuler la suppression"
  # Your IGN Géoportail Api Key
  ignApiKey = ""

  # The id of map container ex <div id="map"></div>
  mapId = "map"

  layers = new Array

  window.mapcontrol = false

  # OpenStreet Map Layer
  OSM = L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png",
    attribution: "&copy; <a href=\"http://osm.org/copyright\">OpenStreetMap</a>"
  )

  #  Orthophoto
  scanWmtsUrl = 'http://gpp3-wxs.ign.fr/'+ignApiKey+'/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image%2Fjpeg'
  console.log(scanWmtsUrl)
  ortho = L.tileLayer(scanWmtsUrl,
    attribution: "&copy; <a href=\"http://www.ign.fr/\">IGN</a>"
  )
    #   # IGN Cadastre
  cadWmtsUrl = 'http://gpp3-wxs.ign.fr/'+ignApiKey+'/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=CADASTRALPARCELS.PARCELS&STYLE=bdparcellaire_b&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image%2Fpng&TRANSPARENT=TRUE'
  console.log(cadWmtsUrl)
  cad = L.tileLayer(cadWmtsUrl,
    attribution: "&copy; <a href=\"http://www.ign.fr/\">IGN</a>",
    transparent: true,
    format: 'image/png'
  )
  # IGN Topo
  scan25url = "http://gpp3-wxs.ign.fr/"+ ignApiKey + "/wmts?LAYER=GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN-EXPRESS.STANDARD&EXCEPTIONS=text/xml&FORMAT=image/jpeg&SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&STYLE=normal&TILEMATRIXSET=PM&&TILEMATRIX={z}&TILECOL={x}&TILEROW={y}" ;
  scan25 = L.tileLayer(cadWmtsUrl,
    attribution: "&copy; <a href=\"http://www.ign.fr/\">IGN</a>",
  )


  map = L.map(mapId,
     center: new L.LatLng(43.9494421840412, 4.881191253662109)
     zoom: 13
     layers: [OSM]
  )
  window.map = map
  baseMap =
    "IGN Orthophto": ortho
    "OpenStreetMap": OSM
    #"IGN scan25"   : scan25
  
  overlayMaps =
    "Ign Cadastre": cad


  L.control.layers(baseMap, overlayMaps).addTo map
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
  L.control.scale(imperial:false).addTo(map)

  onMapClick = (e) ->
     console.log e
     console.log e.latlng
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
  #mapcontrol.on "click", onMapClick

  map.on "draw:created", (e) ->
    drawnItems.clearLayers()
    layer = e.layer
    drawnItems.addLayer layer
    window.debug = layer
    window.data = layer.toGeoJSON()
    $('#parcelle-area').html('<span id=parcelle-area>'+ (LGeo.area(e.layer) / 10000).toFixed(2) + ' ha</sup></span>')
    return
  
  map.on "draw.started", (e) ->
    map.removeLayer drawnItems
    return

  onZoom = () ->
    console.log map.getZoom()
    if (map.getZoom() > 15)
      map.removeLayer OSM
      map.addLayer cad
      map.addLayer ortho

    else
      map.removeLayer cad
    return
    # if (map.getZoom() > 15)
    #   if window.mapcontrol == false
    #     map.addControl drawControl
    #     window.mapcontrol = true
    # else
    #   if window.mapcontrol
    #     map.removeControl drawControl
    #     window.mapcontrol = false
    # return

  map.on 'zoomend', onZoom

  $('#storedraw').click ->
    $.post("http://localhost:3000/api/v1/datastore",
      contentType: "application/json",
      dataType: 'json',
      geom: JSON.stringify(window.data)
    ).done (data) ->
      console.log data
      $('#parcelle-info').html('<span>Références pour récupérer le fichier : '+ data.reference + '</span>')
      return

  onEachFeature = (feature, layer) ->
    $('#parcelle-info tbody:last').after('<tr>commune:'+feature.properties.nom_com+'</tr><tr><td>'+feature.properties.numero+'</td><td>'+feature.properties.feuille+'</td><td>'+feature.properties.section+'</td><td>'+ feature.properties.surface_intersection + '</td></tr>')
    layer.bindPopup('surface parcelle : '+feature.properties.surface_parcelle+'<br>')
    return


  $('#testcadastre').click ->
    $.post("http://localhost:8000/cadastre",
      contentType: "application/json",
      dataType: 'json',
      geom: JSON.stringify(window.data)
    ).done (data) ->
      console.log data
      map.removeLayer(data)
      $('#parcelle-info').html = ""
      layer = L.geoJson(data, {onEachFeature: onEachFeature, color: "#ff0000"}).addTo(map)
      return
  return
