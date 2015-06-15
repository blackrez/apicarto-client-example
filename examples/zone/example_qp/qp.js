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
    mapId = "map_qp";
    layers = new Array;

    window.featureCollection = new Object()
    window.featureCollection.type = 'FeatureCollection';
    window.featureCollection.features = new Array();
    window.mapcontrol = false;
    OSM = L.tileLayer("http://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png", {
      attribution: '&copy; Openstreetmap France | &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });
    map = L.map(mapId, {
      center: new L.LatLng(43.9494421840412, 4.881191253662109),
      zoom: 13,
      layers: [OSM]
    });
    window.map = map;
    baseMap = {
      "OpenStreetMap": OSM
    };
    var info = L.control();
    L.control.layers(baseMap).addTo(map);
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
          metric: true,
          repeatMode: false
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
      layer = e.layer;
      drawnItems.addLayer(layer);
      console.log(layer);
      $.ajax({
        url: 'http://localhost:8000/zoneville/api/v1/qp',
        datatype: 'json',
        method: 'POST',
        data: {geom:layer.toGeoJSON()},
        jsonCallback: 'getJson',
        success: function (data){
          var qp_supp = "";
          feature = layer.toGeoJSON()
          feature.properties = data;
          window.featureCollection.features.push(layer.toGeoJSON());
          for (i = 0; i < data.length; i++){
            qp_supp += "<br><span>Quartier(s) prioritaire(s) : " + data[i].code_qp+  " - " +data[i].nom_qp;
          }
          $("#selection_qp").append("<span>Dessin personnalisé</span><br>"+qp_supp +'<br>');
        }
      });
    });
    $.ajax({
      url: 'http://apicarto.coremaps.com/zoneville/api/beta/qp/mapservice',
      datatype: 'json',
      jsonCallback: 'getJson',
      success: loadGeoJson
    });
    window.geom_inter = {index:[]};

    function onEachFeature(feature, layer) {
      layer.on("mouseover", function (e) {
                //layer.setStyle();              
                info.update({nom_qp:feature.properties.nom_qp, commune_qp:feature.properties.commune_qp})
              });
      layer.on("mouseout", function (e) { 
              //layer.setStyle(huc_default_style)
              info.update() }); 
      layer.on("click", function (e) {
              //layer.setStyle(huc_default_style)
              var feature = e.target.feature
              if (window.geom_inter.index.indexOf(feature.properties.code_qp) == -1){
                window.geom_inter.index.push(feature.properties.code_qp);
                window.featureCollection.features.push(feature);
                $("#selection_qp").append("<span>Quartier sélectionné : "+ feature.properties.code_qp +"</span><br>");
              }
            });    
    };

    function style(feature) {
      return {
        fillColor: '#FC4E2A',
        weight: 1,
        opacity: 1,
        color: 'white',
        dashArray: '0',
        fillOpacity: 0.6
      };
    }

    function loadGeoJson(data) {
      var qpLayer = L.geoJson(data, {onEachFeature: onEachFeature, style:style()}).addTo(map);
    };

    info.onAdd = function (map) {
      this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
      this.update();
      return this._div;
    };

    // method that we will use to update the control based on feature properties passed
    info.update = function (props) {
    this._div.innerHTML = '<h4>Quartier prioritaire</h4>' +  (props ?
      '<b>' + props.nom_qp + '</b><br />' + props.commune_qp
      : 'survolez un quartier prioritaire');
    };

    info.addTo(map);

    $('#storedraw').click(function() {
      geom = turf.merge(window.featureCollection)
      return $.post("http://apicarto.coremaps.com/api/v1/datastore", {
        contentType: "application/json",
        dataType: 'json',
        geom: JSON.stringify(geom)
      }).done(function(data) {
        $('#info').append('<span>Références pour récupérer le fichier : ' + data.reference + '</span>');
      });
    });
  });

}).call(this);