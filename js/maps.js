          //Angular App Module and Controller
          var sampleApp = angular.module('mapsApp', []);
          sampleApp.controller('MapCtrl', function ($scope) {
		$scope.markers = [];

              var mapOptions = {
                  zoom: 4,
                  center: new google.maps.LatLng(25,80),
                  mapTypeId: google.maps.MapTypeId.TERRAIN
              }

              $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);
	      google.maps.event.addListener($scope.map,'click', function(e) {$scope.createMarker(e.latLng);});
              

              var infoWindow = new google.maps.InfoWindow();

              $scope.createMarker = function (info){

                  var marker = new google.maps.Marker({
                      map: $scope.map,
                      position: info,
                      title:"ejemplo"
                  });
                  marker.content = '<div class="infoWindowContent">' + info+ '</div>';

                  google.maps.event.addListener(marker, 'click', function(){
                      infoWindow.setContent('<h2>' + marker.title + '</h2>' + marker.content);
                      infoWindow.open($scope.map, marker);
                  });

                  $scope.markers.push(marker);
console.log($scope.markers);

              }

              $scope.openInfoWindow = function(e, selectedMarker){
                  e.preventDefault();
                  google.maps.event.trigger(selectedMarker, 'click');
              }

          });
