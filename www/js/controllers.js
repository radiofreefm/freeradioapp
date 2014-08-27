/*
 * FREIE RADIO APP
 * https://github.com/radiofreefm/freeradioapp/
 *
 * Controllers for Angular.js
 */


freeradioapp.controller('MetaController', function ($scope, SharedStationService, MetaXMLService) {
	$scope.meta = null;

	$scope.handleStationSelect = function(id) {
		console.log($scope.meta.stationlist.station[id].xmluri.hashCode());
    	SharedStationService.prepForBroadcast($scope.meta.stationlist.station[id].xmluri);
    }

	//This is the callback function
    setMetaData = function(data) {
        $scope.meta = data.freeradioapp;
        console.log(data);
    }
    MetaXMLService.get(setMetaData);
});


freeradioapp.controller('StationController', function ($scope, $rootScope, SharedStationService, StationXMLService) {
	$scope.stationdata = null;

    setStationData = function(data) {
    	console.log(data);
		$scope.stationdata = data.station;
    }

    selectStation = function(url) {
    	StationXMLService.get(setStationData, url);
    }

    $rootScope.$on('handleBroadcast', function() {
        stationdata = selectStation(SharedStationService.url);
    });
});


freeradioapp.controller('FavoriteController', function ($scope, FavoriteService) {
	$scope.favoritedata = FavoriteService.get();
});