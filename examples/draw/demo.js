(function() {

  $(function() {
    var LeafIcon, OSM, baseMap, cad, cadWmtsUrl, drawControl, drawnItems, greenIcon, ignApiKey, layers, map, mapId, onEachFeature, onMapClick, onZoom, ortho, overlayMaps, scan25, scan25url, scanWmtsUrl;
    L.drawLocal.draw.toolbar.buttons.polygon = 'Dessiner un polygone';
    L.drawLocal.draw.toolbar.actions.title = "Annule le dessin en cours";
    L.drawLocal.draw.toolbar.actions.text = "Annuler";
    L.drawLocal.draw.toolbar.undo.text = "Supprimer le dernier point";
    L.drawLocal.draw.toolbar.undo.title = "Supprime le dernier point dessiné";
    L.drawLocal.draw.handlers.polygon.tooltip.start = "Cliquer pour commencer le dessin";
    L.drawLocal.draw.handlers.polygon.tooltip.cont = "Cliquer pour continuer le dessin";
    L.drawLocal.draw.handlers.polygon.tooltip.end = "Cliquer sur le premier point pour finaliser votre dessin";
    L.drawLocal.edit.toolbar.actions.save.title = "Valide les modifications";
    L.drawLocal.edit.toolbar.actions.save.text = "Valider les modifications";
    L.drawLocal.edit.toolbar.actions.cancel.title = "Annule les modifications";
    L.drawLocal.edit.toolbar.actions.cancel.text = "Annuler les modifications";
    L.drawLocal.edit.handlers.edit.tooltip.text = "Déplacer les points pour éditer le dessin";
    L.drawLocal.edit.handlers.edit.tooltip.subtext = "Cliquer sur 'annuler' pour annuler les changements";
    L.drawLocal.edit.toolbar.buttons.edit = "Édition du dessin";
    L.drawLocal.edit.toolbar.buttons.editDisabled = "Aucun dessin à éditer";
    L.drawLocal.edit.toolbar.buttons.removeDisabled = "Aucun dessin à supprimer";
    L.drawLocal.edit.toolbar.buttons.remove = "Supprimer le dessin";
    L.drawLocal.edit.handlers.remove.tooltip.text = "Cliquer sur le dessin pour le supprimer";
    L.drawLocal.edit.handlers.remove.tooltip.subtext = "Cliquer sur 'annuler' pour annuler la suppression";
    ignApiKey = "bdhazkah4qk8oeqsh9d9m5yq";
    mapId = "map";
    layers = new Array;
    window.mapcontrol = false;
    OSM = L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
      attribution: "&copy; <a href=\"http://osm.org/copyright\">OpenStreetMap</a>"
    });
    scanWmtsUrl = 'http://gpp3-wxs.ign.fr/' + ignApiKey + '/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image%2Fjpeg';
    ortho = L.tileLayer(scanWmtsUrl, {
      attribution: "&copy; <a href=\"http://www.ign.fr/\">IGN</a>"
    });
    cadWmtsUrl = 'http://gpp3-wxs.ign.fr/' + ignApiKey + '/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=CADASTRALPARCELS.PARCELS&STYLE=bdparcellaire_b&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image%2Fpng&TRANSPARENT=TRUE';
    cad = L.tileLayer(cadWmtsUrl, {
      attribution: "&copy; <a href=\"http://www.ign.fr/\">IGN</a>",
      transparent: true,
      format: 'image/png'
    });
    scan25url = "http://gpp3-wxs.ign.fr/" + ignApiKey + "/wmts?LAYER=GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN-EXPRESS.STANDARD&EXCEPTIONS=text/xml&FORMAT=image/jpeg&SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&STYLE=normal&TILEMATRIXSET=PM&&TILEMATRIX={z}&TILECOL={x}&TILEROW={y}";
    scan25 = L.tileLayer(cadWmtsUrl, {
      attribution: "&copy; <a href=\"http://www.ign.fr/\">IGN</a>"
    });
    map = L.map(mapId, {
      center: new L.LatLng(44.727006, -0.475243),
      zoom: 13,
      layers: [OSM]
    });
    window.map = map;
    baseMap = {
      "IGN Orthophto": ortho,
      "OpenStreetMap": OSM
    };
    overlayMaps = {
      "Ign Cadastre": cad
    };
    L.control.layers(baseMap, overlayMaps).addTo(map);
    LeafIcon = L.Icon.extend({
      options: {
        shadowUrl: "http://leafletjs.com/docs/images/leaf-shadow.png",
        iconSize: [38, 95],
        shadowSize: [50, 64],
        iconAnchor: [22, 94],
        shadowAnchor: [4, 62],
        popupAnchor: [-3, -76]
      }
    });
    greenIcon = new LeafIcon({
      iconUrl: "http://leafletjs.com/docs/images/leaf-green.png"
    });
    drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    drawControl = new L.Control.Draw({
      position: "topright",
      draw: {
        polygon: {
          shapeOptions: {
            color: "purple"
          },
          allowIntersection: false,
          drawError: {
            color: "orange",
            timeout: 1000
          },
          showArea: false,
        },
        marker: false,
        polyline: false,
        rectangle: false,
        circle: false
      },
      edit: {
        featureGroup: drawnItems
      }
    });
    map.addControl(drawControl);
    L.control.scale({
      imperial: false
    }).addTo(map);
    map.on("draw:created", function(e) {
      var layer;
      drawnItems.clearLayers();
      layer = e.layer;
      drawnItems.addLayer(layer);
      window.debug = layer;
      window.data = layer.toGeoJSON();
      $('#parcelle-area').html('<span id=parcelle-area>' + (LGeo.area(e.layer) / 10000).toFixed(4) + ' ha</span>');
    });
    map.on("draw:edited", function(e) {
      console.log("edited");
      console.log(e);
      drawnItems.clearLayers();
      e.layers.eachLayer(function(layer) {
        drawnItems.addLayer(layer);
        window.debug = layer;
        window.data = layer.toGeoJSON();
        $('#parcelle-area').html('<span id=parcelle-area>' + (LGeo.area(layer) / 10000).toFixed(4) + ' ha</span>');
      });

    });
    map.on("draw:deletestop", function(e) {
      window.data = {};
      $('#parcelle-area').html('<span id=parcelle-area></span>');
    });
    map.on("draw.started", function(e) {
      map.removeLayer(drawnItems);
    });
    onZoom = function() {
      if (map.getZoom() > 15) {
        map.removeLayer(OSM);
        map.addLayer(cad);
        map.addLayer(ortho);
      } else {
        map.removeLayer(cad);
      }
    };
    map.on('zoomend', onZoom);
    $('#storedraw').click(function() {
      return $.post("http://apicarto.coremaps.com/api/v1/datastore", {
        contentType: "application/json",
        dataType: 'json',
        geom: JSON.stringify(window.data)
      }).done(function(data) {
        $('#parcelle-info').html('<span>Références pour récupérer le fichier : ' + data.reference + '</span>');
      });
    });
    onEachFeature = function(feature, layer) {
      $('#parcelle-info tbody:last').after('<tr>commune:' + feature.properties.nom_com + '</tr><tr><td>' + feature.properties.numero + '</td><td>' + feature.properties.feuille + '</td><td>' + feature.properties.section + '</td><td>' + feature.properties.surface_intersection + '</td></tr>');
      layer.bindPopup('surface parcelle : ' + feature.properties.surface_parcelle + '<br>');
    };


    $('#testcadastre').click(function() {
      return $.post("http://apicarto.coremaps.com/cadastre", {
        contentType: "application/json",
        dataType: 'json',
        geom: JSON.stringify(window.data)
      }).done(function(data) {
        var layer;
        map.removeLayer(data);
        $('#parcelle-info').html = "";
        layer = L.geoJson(data, {
          onEachFeature: onEachFeature,
          color: "#ff0000"
        }).addTo(map);
      });
    });

    onEachFeatureaoc = function(feature, layer) {
      $('#parcelle-info tbody:last').after('<tr>commune:' + feature.properties.nom_com + '</tr><tr><td>' + feature.properties.numero + '</td><td>' + feature.properties.feuille + '</td><td>' + feature.properties.section + '</td><td>' + feature.properties.surface_intersection + '</td></tr>');
      layer.bindPopup('surface parcelle : ' + feature.properties.area + '<br>');
    };
    onEachFeatureaocbox = function(feature, layer) {
      $('#aocbox').append('<br> Appellation : ' + feature.properties.appellation + '<br>Commune : ' + feature.properties.commune);
    };
    $('#testaoc').click(function() {
      return $.post('http://apicarto.coremaps.com/aoc/api/beta/aoc/in', {
        contentType: "application/json",
        dataType: 'json',
        geom: JSON.stringify(window.data)
      }).done(function(data) {
        var layer;
        map.removeLayer(data);
        $('#parcelle-aoc').html = "";
        layer = L.geoJson(data, {
          onEachFeature: onEachFeatureaoc,
          color: "yellow"
        }).addTo(map);
      });
    });
    var layers = {};

    map.on('moveend', function() {
      bbox = this.getBounds().toBBoxString();
      $.get('http://apicarto.coremaps.com/aoc/api/beta/aoc/bbox', {
        contentType: "application/json",
        dataType: 'json',
        bbox: bbox
      }).done(function(data) {
        var layer;
        if (typeof layers.aoc != "undefined"){
          map.removeLayer(layers['aoc']);
          $('#aocbox').empty();
        }
        layer = L.geoJson(data, {
          onEachFeature: onEachFeatureaocbox,
          color: "yellow",
          fillOpacity: 0
        })
        layers['aoc'] = layer;
        layer.addTo(map);
      });
    })
  });
}).call(this);
