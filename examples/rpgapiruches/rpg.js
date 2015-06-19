(function() {
  $(function() {
    OSM = L.tileLayer("http://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png", {
      attribution: '&copy; Openstreetmap France | &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });
    window.map = map;
    map = L.map("map", {
      center: new L.LatLng(43.26077, 0.97799),
      zoom: 13,
      layers: [OSM]
    });
    baseMap = {
      "OpenStreetMap": OSM
    };
    var info = L.control();
    $.ajax({
      url: 'http://apicarto.coremaps.com/rpg/api/beta/distance?geojson={%22type%22:%22Point%22,%22coordinates%22:[0.97799,43.26077]}',
      datatype: 'json',
      jsonCallback: 'getJson',
      success: loadGeoJson
    });
    function loadGeoJson(data) {
      var qpLayer = L.geoJson(data, {onEachFeature: onEachFeature, style:style}).addTo(map);
    };
        function style(feature) {
          console.log(feature);
          cult_color = {"1":"#FC4E2A","6":"#FA4E2A","4":"#AC4E2A","18":"#234E2A","19":"#AA4E2A","2":"#12C4E2","13":"#BC4E2A"}
      return {
        fillColor: cult_color[feature.properties.cult_maj],
        weight: 1,
        opacity: 1,
        color: 'white',
        dashArray: '0',
        fillOpacity: 0.6
      };
    }
        info.onAdd = function (map) {
      this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
      this.update();
      return this._div;
    };
    var marker = L.marker([43.26077, 0.97799]).addTo(map);
    marker.bindPopup("Votre ruche et son champ de buttinage.").openPopup();

    var circle = L.circle([43.26077, 0.97799], 1500, {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5
}).addTo(map);
    // method that we will use to update the control based on feature properties passed
    var cult = {"1":"Blé tendre","6":"Tournesol","4":"Céréales","18":"Prairies","19":"Prairies","2":"Maïs","13":"Gel des terres"}
    info.update = function (props) {
      console.log(props);
    this._div.innerHTML = '<h4>Registre Parcellaire</h4>' +  (props ?
      '<b>distance (en m) : ' + props.distance + '</b><br />Type culture:' + cult[props.cult_maj]
      : 'survolez une parcelle');
    };

    info.addTo(map);
      function onEachFeature(feature, layer) {
      layer.on("mouseover", function (e) {
                //layer.setStyle();              
                info.update({distance:feature.properties.distance, cult_maj:feature.properties.cult_maj})
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
  })  
}).call(this);