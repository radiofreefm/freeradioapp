/*
 * FREIE RADIO APP
 * https://github.com/radiofreefm/freeradioapp/
 *
 * Controllers for Angular.js
 */


freeradioapp.controller('MetaController', function ($scope, SharedStationService, MetaXMLService) {
	$scope.meta = null;

	$scope.handleStationSelect = function(id, name) {
		console.log(name.hashCode());
    	SharedStationService.prepForBroadcast($scope.meta.stationlist.station[id].xmluri, name);
    }

	//This is the callback function
    setMetaData = function(data) {
        $scope.meta = data.freeradioapp;
        console.log(data);
    }
    MetaXMLService.getLokal(setMetaData);
});


freeradioapp.controller('StationController', function ($scope, $rootScope, SharedStationService, StationXMLService) {
	$scope.stationdata = null;

    setStationData = function(data) {
    	console.log(data);
		$scope.stationdata = data.station;
    }

    selectStation = function(url, name) {
    	StationXMLService.getLokal(setStationData, url, name);
    }

    $rootScope.$on('handleBroadcast', function() {
        stationdata = selectStation(SharedStationService.url, SharedStationService.name);
    });
});


freeradioapp.controller('FavoriteController', function ($scope, FavoriteService) {
	$scope.favoritedata = FavoriteService.get();
});