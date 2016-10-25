          //Angular App Module and Controller
          var sampleApp = angular.module('mapsApp', []);
          sampleApp.controller('MapCtrl',["$scope","$http", function ($scope,$http) {
              $http.defaults.useXDomain = true;
              delete $http.defaults.headers.common['X-Requested-With'];
              $scope.wsURI='wss://localhost:8443/Wondercode_RouteCity/socket';
              $scope.websocket = new WebSocket($scope.wsURI);
              $scope.websocket.onopen = function(e) {
                alert('Conectado');
              };
              $scope.websocket.onerror = function(e) {
                console.log(e);
              };
              $scope.websocket.onmessage = function(e) {
                var data=JSON.parse(e.data);
                var l=data.nodes.length;
                for(var i=0;i<l;i++){
                  var circle = new google.maps.Circle({
                                  center:new google.maps.LatLng(data.nodes[i].lat,data.nodes[i].lng),
                                  radius:10,
                                  strokeColor:"#E06F60",
                                  strokeOpacity:0.8,
                                  strokeWeight:2,
                                  fillColor:"#E06F60",
                                  fillOpacity:0.4
                                });
                  circle.setMap($scope.map);
                }
              };
              $scope.delay=function(time){
                for(var i=0;i<time;i++){
                  setTimeout('return 0',1);
                }
              };
		          $scope.markers = [];
              $scope.apiKey='AIzaSyDbFxP_lRwoEfSEeLFt0ZErs7igNbb6SQs';
              $scope.nodes=[];
              $scope.circles=[];
              $scope.pointsR=[];
              $scope.snappedCoordinates = [];
              var mapOptions = {
                  zoom: 17,
                  center: new google.maps.LatLng(6.2359,-75.5751)
              };
              $scope.smarkers=[];
              $scope.prueba=function(){
                $scope.markers=$scope.markers;
              };
              $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);
              //$scope.map.addListener('click',function(e){$scope.createMarker(e.latLng)});
              $scope.infoWindow = new google.maps.InfoWindow();
              $scope.createMarker = function (info){
                  var marker = new google.maps.Marker({
                      map: $scope.map,
                      position: info,
                      title:'Punto '+($scope.markers.length+1)
                  });
                  marker.content = '<div class="infoWindowContent">' + info+ '</div>';
                  google.maps.event.addListener(marker, 'click', function(){
                      $scope.infoWindow.setContent('<h2>' + marker.title + '</h2>' + marker.content);
                      $scope.infoWindow.open($scope.map, marker);
                  });
                  $scope.markers.push(marker);
                  $scope.smarkers.push(info);
                  var m=document.getElementById('machete');
                  m.click();
              };
              $scope.clickElemento=function(index){
                var marker=$scope.markers[index];
                $scope.infoWindow.setContent('<h2>' + marker.title + '</h2>' + marker.content);
                $scope.infoWindow.open($scope.map, marker);
              };
              $scope.delete=function(index){
                $scope.markers[index].setMap(null);
                $scope.circles[index].setOptions({fillColor:"#0000FF",strokeColor:"#0000FF"});
                $scope.markers.splice(index,1);
                $scope.nodes.push($scope.circles[index]);
                $scope.circles.splice(index,1);
                $scope.smarkers.splice(index,1);
                if(index!==$scope.markers.length){
                  for(var i=index;i<$scope.markers.length;i++){
                    $scope.markers[i].title='Punto '+(i+1);
                  }
                }
              };
              $scope.duplicate=function(index){
                $scope.createMarker($scope.markers[index].position);
              }
              $scope.openInfoWindow = function(e, selectedMarker){
                  e.preventDefault();
                  google.maps.event.trigger(selectedMarker, 'click');
              };
              $scope.getNodes=function(){
                var le=$scope.nodes.length;
                for(var i=0;i<le;i++){
                  $scope.nodes[i].setMap(null);
                }
                $scope.nodes=[];
                var sw=$scope.map.getBounds().getSouthWest();
                var ne=$scope.map.getBounds().getNorthEast();
                $http.get('http://localhost:8080/Wondercode_RouteCity/route/cheaper/getNodesInBounds/'+sw.lat()+'/'+sw.lng()+'/'+ne.lat()+'/'+ne.lng())
                .success(function(data) {
                    var l=data.nodes.length;
                    for(var i=0;i<l;i++){
                      var circle = new google.maps.Circle({
                                      center:new google.maps.LatLng(data.nodes[i].lat,data.nodes[i].lng),
                                      radius:5,
                                      strokeColor:"#E06F60",
                                      strokeOpacity:0.8,
                                      strokeWeight:2,
                                      fillColor:"#E06F60",
                                      fillOpacity:0.4
                                    });
                      circle.setMap($scope.map);
                      var ind=$scope.circles.indexOf(circle);
                      if(ind==-1){
                        circle.setOptions({fillColor:"#0000FF",strokeColor:"#0000FF"});
                        $scope.nodes.push(circle);
                      }
                      google.maps.event.addListener(circle, 'click', function(ev){
                          $scope.createMarker(this.getCenter());
                          this.setOptions({fillColor:"#E06F60",strokeColor:"#E06F60"});
                          var index=$scope.nodes.indexOf(this);
                          if(index!==-1){
                            $scope.nodes.splice(index,1);
                          }
                          $scope.circles.push(this);
                      });

                    }
                })
                .error(function(err) {
                    return err;
                });
              };
              $scope.verRuta=function(){
                $http.get('https://www.googleapis.com/fusiontables/v1/query?sql=SELECT%20geometry%20FROM%201_ihDJT-_zFRLXb526aaS0Ct3TiXTlcPDy_BlAz0%20WHERE%20CODIGO_RUT=%27'+$scope.nombreRuta+'%27&key=AIzaSyC59BP_KRtQDLeb5XM_x0eQNT_tdlBbHZc')
                .success(function(data) {
                    $scope.pointsR=[];
                    console.log(data);
                    var d=data.rows[0][0];
                    var l=0;
                    if('type' in d){
                      for (var i = 0; i < d.geometries.length; i++) {
                        $scope.addCoordinates(d.geometries[i].coordinates);
                        $scope.drawSnappedPolyline();
                      }
                    }else{
                      $scope.addCoordinates(d.geometry.coordinates);
                      $scope.drawSnappedPolyline();
                    }

                })
                .error(function(err) {
                    return err;
                });
              };
              $scope.addCoordinates=function(coors) {
                $scope.snappedCoordinates = [];
                for (var i = 0; i < coors.length; i++) {
                  var latlng = new google.maps.LatLng(
                      coors[i][1],
                      coors[i][0]);
                  $scope.snappedCoordinates.push(latlng);
                  $scope.pointsR.push(latlng);
                }
              };
              $scope.verRecorrido=function(){
                var points=[];
                var l=$scope.markers.length;
                for(var i=0;i<l;i++){
                  points.push($scope.markers[i].getPosition().toUrlValue());
                }
                $http.get('https://roads.googleapis.com/v1/snapToRoads/?interpolate=true&path='+points.join('|')+'&key='+$scope.apiKey)
                .success(function(data) {
                    $scope.processSnapToRoadResponse(data);
                    $scope.drawSnappedPolyline();
                })
                .error(function(err) {
                    return err;
                });
              };
              $scope.guardar=function(){
                var s = JSON.stringify($scope.smarkers);
                var file = new Blob([s], {type:'application/json'});
                var objectUrl = URL.createObjectURL(file);
                var a = document.getElementById("a");
                a.href = objectUrl;
                a.download = $scope.nombreRuta+'.json';
                a.click();
              };
              // Store snapped polyline returned by the snap-to-road service.
            $scope.processSnapToRoadResponse=function(data) {
              $scope.snappedCoordinates = [];
              for (var i = 0; i < data.snappedPoints.length; i++) {
                var latlng = new google.maps.LatLng(
                    data.snappedPoints[i].location.latitude,
                    data.snappedPoints[i].location.longitude);
                $scope.snappedCoordinates.push(latlng);
              }
            };

              // Draws the snapped polyline (after processing snap-to-road response).
              $scope.drawSnappedPolyline=function() {
                var snappedPolyline = new google.maps.Polyline({
                  path: $scope.snappedCoordinates,
                  strokeColor: '#4285F4',
                  strokeWeight: 5
                });
                snappedPolyline.setMap($scope.map);
              }

          }]);
