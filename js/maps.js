          //Angular App Module and Controller
          var sampleApp = angular.module('mapsApp', []);
          sampleApp.controller('MapCtrl',["$scope", function ($scope) {
		          $scope.markers = [];
              var mapOptions = {
                  zoom: 13,
                  center: new google.maps.LatLng(6.2359,-75.5751)
              };
              $scope.smarkers=[];
              $scope.prueba=function(){
                $scope.markers=$scope.markers;
              };
              $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);
              $scope.map.addListener('click',function(e){$scope.createMarker(e.latLng)});
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
                  console.log($scope.smarkers);
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
                $scope.markers.splice(index,1);
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
              $scope.guardar=function(){
                var s = JSON.stringify($scope.smarkers);
                console.log(s);
                var file = new Blob([s], {type:'application/json'});
                var objectUrl = URL.createObjectURL(file);
                var a = document.getElementById("a");
                a.href = objectUrl;
                a.download = $scope.nombreRuta+'.json';
                a.click();
              }

          }]);
