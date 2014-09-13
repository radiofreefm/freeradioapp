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
    $rootScope.stationData = DataService.getStationData();

    /**
     * Updating data if new cache-data
     */
    $rootScope.metaData.update(function(data){
        $rootScope.metaData = data;
        console.log("MetaData updated");
        console.log(data);

        // refresh jQuery.mobile component styling
        $("[data-role='listview']").listview().listview('refresh');
    });

    $rootScope.stationData.update(function(data){
        $rootScope.stationData = data;
        console.log("StationData updated");
        console.log(data);

        // refresh jQuery.mobile component styling
        $("[data-role='listview']").listview().listview('refresh');
    });

    DataService.init();

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
    

    // Old version with event-system and standard $q - not working with multiple updates
    /*
    function updateStationData(data) {
        $rootScope.stationData = data;
        console.log("StationData updated");
        console.log(data);
    }

    DataService.stationDataPromise.then(function(newStationData) {
        updateStationData(newStationData);
    }, function(error) {
        //TODO: ErrorHandling
    });

    // global broadcast - stationdata was updated
    $rootScope.$on('stationDataUpdateEvent', function(ev, newStationDataPromise) {
        newStationDataPromise.then(function(newStationData) {
            updateStationData(newStationData);
        }, function(error) {
            //TODO: ErrorHandling
            console.log("<ERROR> stationDataUpdateEvent failed due to " + error);
        });
    });*/

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
freeradioapp.controller('StationDetailController', function ($log, $scope, $rootScope, SharedStationService, XMLDataService) {
    $scope.noData = true;

    // remote data
    updateStationData = function(message) {
        if($rootScope.stationData.stations[message.name] === undefined) {
            // TODO: errorhandling in case of missing data!
            $log.warn("StationDetailController: No cached station data found for '" + message.name +"'.")
            /*XMLDataService.getLocal(message.name.hashCode()+".xml")
            .then(function(data){
                $scope.selectedStationData = data;
                $scope.noData = false;
            }, function(e){
                $log.error("StationDetailController: No local station.xml found for '" + message.name + "'.");
                $scope.noData = true;
            });*/
        }
        else {
            $scope.selectedStationData = $rootScope.stationData.stations[message.name].station;
            $scope.noData = false;
        }
    }

    // global broadcast - station was selected
    $rootScope.$on('handleBroadcast', function() {
        updateStationData(SharedStationService.message);
    });
});

/**
 * Saving and loading favorites
 */
freeradioapp.controller('FavoriteController', function ($log, $scope, FavoriteService) {
	//TODO
    $scope.favorites = FavoriteService.getFavorites();
    $scope.noData = true;
    
    $scope.favorites.update(function(data){
        $scope.favorites= data;
        $scope.noData = false;
        console.log("Updated Favorites:");
        console.log(data);
    }, function(e){
        $log.warn("FavoriteController: no favorites for user.")
        $scope.noData = true;
    });

    FavoriteService.init();

});


/**
 * Searching through the avaiblable stations and broadcasts.
 * All done in HTML via decorators.
 */
freeradioapp.controller('SearchController', function ($rootScope, $scope) {
    $scope.$watch('searchTerm', function(){ 
        // refresh jQuery.mobile styles on list-items
        $('#searchList ul').listview().listview('refresh');
    });

    // order by:
    $scope.orderProp = "name";
});


/**
 * Custom category filter for Sendeplan
 * TODO: implement for more then one broadcast!
 */
angular.module("FreeRadioApp.filters", []).filter("categoryFilter", function() {
    return function(input, scope) {
        var result = {};
        var _scope = scope;
        angular.forEach(input, function(station){
            //console.table(station.station.programme.broadcast.categories.category);
            //console.table(_scope.categories);

            // TODO: filter here
            result[station.station.info.fullname] = station;
        });
        return result;
    };
});

/**
 * Broadcasting schedule
 */
freeradioapp.controller('ScheduleController', function ($rootScope, $scope, $timeout, BROADCAST_CATEGORIES) {
    $scope.$evalAsync(function(scope){
        $timeout(function(){
            // TODO: do
        });
    });

    $scope.categories = BROADCAST_CATEGORIES;
    angular.forEach($scope.categories, function(value, key){
        value["_checked"] = false;
    });

    $scope.timeframes = [

    ];

    $scope.toggleSelection = function(id){
        $scope.categories[id]._checked = !$scope.categories[id]._checked;
    }
/*
    $scope.categoryFilter = function(broadcast){
        debugger;
        angular.forEach($scope.categories, function(value, key) {
            if(value._checked) {

            }
        });

        return true;
    }*/
});