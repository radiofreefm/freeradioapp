/*
 * FREIE RADIO APP
 * https://github.com/radiofreefm/freeradioapp/
 *
 * Controllers for Angular.js
 */


/**
 * Controller for retreiving meta.xml data for stations-list
 */
freeradioapp.controller('AppController', function ($http, $scope, $rootScope, SharedStationService, DataService) {
    // at first, load data from cache
    $rootScope.metaData = DataService.getMetaData();
    $rootScope.stationData = {};

    /**
     * Updating metadata if new cache-data
     */
    function updateMetaData(data) {
        $rootScope.metaData = data;
        console.log("MetaData updated");
        console.log(data);
    }

    // update scope-data when new data is available
    $rootScope.metaData.update(function(data){
        updateMetaData(data);
    });

    // Old version with event-system and standard $q - not working with multiple updates
    /*DataService.metaDataPromise.then(function(newMetaData) {
        updateMetaData(newMetaData);
    }, function(error) {
        //TODO: ErrorHandling
    });


    // global broadcast - stationdata was updated
    $rootScope.$on('metaDataUpdateEvent', function(ev, newMetaDataPromise) {
        //debugger;
        newMetaDataPromise.then(function(newMetaData) {
            updateMetaData(newMetaData);
        }, function(error) {
            //TODO: ErrorHandling
            console.log("<ERROR> metaDataUpdateEvent failed due to " + error);
        });
    });*/

    /**
     * Updating station if new cache-data
     */
    function updateStationData(data) {
        $rootScope.stationData = data;
        console.log("StationData updated");
        console.log(data);
    }

    /*DataService.stationDataPromise.then(function(newStationData) {
        updateStationData(newStationData);
    }, function(error) {
        //TODO: ErrorHandling
    });*/

    // global broadcast - stationdata was updated
    $rootScope.$on('stationDataUpdateEvent', function(ev, newStationDataPromise) {
        newStationDataPromise.then(function(newStationData) {
            updateStationData(newStationData);
        }, function(error) {
            //TODO: ErrorHandling
            console.log("<ERROR> stationDataUpdateEvent failed due to " + error);
        });
    });

    /**
     * Handle Stationselects
     */
	$rootScope.handleStationSelect = function(id, name) {
    	SharedStationService.prepForBroadcast({id: id, name: name});
    }
});


/**
 * Controller for fetching station.xml data
 */
freeradioapp.controller('StationDetailController', function ($scope, $rootScope, SharedStationService) {

    // remote data
    updateStationData = function(message) {
        $scope.selectedStationData = $rootScope.stationData.stations[message.id].station;
    }

    // global broadcast - station was selected
    $rootScope.$on('handleBroadcast', function() {
        updateStationData(SharedStationService.message);
    });
});

/**
 * Saving and loading favorites
 */
freeradioapp.controller('FavoriteController', function ($scope) {
	//TODO
});


/**
 * TBD
 */
freeradioapp.controller('SearchController', function ($rootScope, $scope, $http, DataService) {
    //TODO
    $scope.searchTerm = {};
});