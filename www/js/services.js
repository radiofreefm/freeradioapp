/*
 * FREIE RADIO APP
 * https://github.com/radiofreefm/freeradioapp/
 *
 * Services for Angular.js
 */


freeradioapp.factory('SharedStationService', function($rootScope) {
    var sharedService = {};
    
    sharedService.message = '';

    sharedService.prepForBroadcast = function(message) {
        this.message = message;
        this.broadcastItem();
    };

    sharedService.broadcastItem = function() {
        $rootScope.$broadcast('handleBroadcast');
    };

    return sharedService;
});

freeradioapp.factory('XMLDataService', function($http){
	var xmlDataService = {};

	xmlDataService.getRemote = function(callback, xmlurl, context){

        // get remote file
        $http({
            method: 'GET',
            /* TODO: CORS problem with accessing remote xmls */
            url: xmlurl,
            headers:{
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
            },
            transformResponse:function(data) {
                // convert the data to JSON and provide
                // it to the success function below
                // IMPORTANT: node name are converted to camelCase for JSON compatiblity!
                var x2js = new X2JS();
                var json = x2js.xml_str2json( data );
                return json;
            }
        }).
        success(function(data, status) {
            // send the converted data back
            // to the callback function
            callback(data, context);
        })
        .error(function(data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            callback({status: -1, mode: "remote", input: xmlurl}, context);
        });
    }

    xmlDataService.getLocal = function(callback, filename, context){
        // get local file
        $http({
            method: 'GET',
            url: "data/" + filename,
            transformResponse:function(data) {
                // convert the data to JSON and provide
                // it to the success function below
                // IMPORTANT: node name are converted to camelCase for JSON compatiblity!
                var x2js = new X2JS();
                var json = x2js.xml_str2json( data );
                return json;
            }
        }).
        success(function(data, status) {
            // send the converted data back
            // to the callback function
            callback(data, context);
        })
        .error(function(data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            callback({status: -1, mode: "local", input: filename}, context);
        });
    }

   return xmlDataService;
});

/**
 * DataService functions as a backend data-caching and -updating service.
 */
function DataService(DeferredWithUpdate, $rootScope, $http, XMLDataService, STATION_EXPIRATION_DAYS, META_EXPIRATION_DAYS) {
    var _that = this;
    var _metaDeferred = DeferredWithUpdate.defer();
    var _metaData = _metaDeferred.promise;

    var _stationData = undefined;
    var _stationDeferred = DeferredWithUpdate.defer();
    this.stationDataPromise = _stationDeferred.promise;

    /**
     * Empty cache and refresh from XML-Data
     */
    var _resetData = function() {
    }

    /**
     * Set new meta data.
     * This will fire a broadcast.
     */
    var _setMetaData = function(data) {
        _metaDeferred.resolve(data);

        // Old Verison: with standard $q and event system
        //$rootScope.$broadcast("metaDataUpdateEvent", _metaData);
    }

    /**
     * Check if metadata is expired.
     */
    var _isMetaDataExpired = function() {
        if(_metaData == undefined)
            return true;

        var metaLastUpdated = new Date(_metaData.freeradioapp._lastupdate);
        var now = Date.now();

        if(Math.round(Math.abs((now.getTime() - metaLastUpdated.getTime())/(72000000))) > META_EXPIRATION_DAYS) {
            return true;
        }
        else {
            return false;
        }
    }

    /**
     * Load metadata from local json-file.
     */
    var _getMetaDataFromCache = function() {
        $http.get('data/meta_cache.json')
        .success(function(data, status, headers, config){
            _setMetaData(data.freeradioapp);
        }, this);

        return( _metaDeferred.promise );
    }

    /**
     * Update metadata json-cache from local xml-file
     */
    var _updateMetaCacheLocal = function() {
        function callback(response){
            if(response.status === -1) {
                console.log("<ERROR> local access of 'meta.xml' failed.");
            }
            else {
                // TODO: save into .json-file
                //_setMetaData(response.freeradioapp);
                _getMetaDataFromCache();
            }
        }

        //TODO: change remote-access url;
        XMLDataService.getLocal(callback, "meta.xml");
        return (_metaDeferred.promise);
    }

    /**
     * Set new station data.
     * This will fire a broadcast.
     */
    var _setStationData = function(data) {
        _stationData = data;
        _stationDeferred.resolve(_stationData);

        // old version with event-system
        //$rootScope.$broadcast("stationDataUpdateEvent", _that.stationDataPromise);
    }

    /**
     * Check if stationdata of given station is expired.
     */
    var _isStationDataExpired = function(id) {
        if(_stationData == undefined)
            return true;

        var stationLastUpdated = new Date(_stationData.stations.station[id]._lastupdate);
        var now = Date.now();

        if(Math.round(Math.abs((now.getTime() - stationLastUpdated.getTime())/(72000000))) > STATION_EXPIRATION_DAYS) {
            return true;
        }
        else {
            return false;
        }
    }

    /**
     * Load stationdata from local json-cache
     */
    var _getStationDataFromCache = function() {
        $http.get('data/stations_cache.json')
        .success(function(data, status, headers, config){
            _setStationData(data);
        });
    }

    /**
     * Update stationdata lcoal json-cache from local xml-files
     */
    var _updateStationCacheLocal = function() {
        if(_that.getMetaData() == undefined) {
            _updateMetaCacheLocal();
            return;
        }

        function callback(response){
            if(response.status == -1) {
                if(response.mode == "local") {
                    console.log("<ERROR> local access of '"+respone.xmlurl+"' failed.")
                } else {
                    console.log("<ERROR> remote access of '"+respone.xmlurl+"' failed.")
                }
            }
            else {
                // TODO: save into .json-file
            }
        }

        angular.forEach(_that.getStationData().stations, function(value, key) {
            XMLDataService.getLocal(callback, value.station.info.fullname.hashCode()+".xml");
        }, _that);
    }

    /*
     * PUBLIC METHODS
     */

    /**
     * Returns metadata-promise
     */
    this.getMetaData = function() {
        return _metaData;
    }

    /**
     * Updates metacache from remote xml-file
     */
    this.updateMetaCache = function() {
        function callback(response){
            if(response.status === -1) {
                console.log("<ERROR> remote access of '"+ response.xmlurl +"' failed.");
            }
            else {
                // TODO: save into .json cache-file
                _setMetaData(response.freeradioapp);
            }
        }

        //TODO: change remote-access url;
        XMLDataService.getRemote(callback, "data/meta-demo.xml");
        //_metaData = _metaDeferred.promise;
        return( _metaDeferred.promise );
    }


    /**
     * Returns current station data.
     */
    this.getStationData = function() {
        return _stationData;
    }
    
    /**
     * Updates stationscache from remote xml-files
     */
    this.updateStationCache = function() {
        if(this.getMetaData() == undefined) {
            this.updateMetaData();
            return;
        }

        function callback(response){
            if(response.status == -1) {
                console.log("<ERROR> local access of '"+ response.xmlurl +"'' failed.")
            }
            else {
                // TODO: save into .json cache-file
            }
        }

        angular.forEach(this.getStationData().stationlist.station, function(value, key) {
            XMLDataService.getRemote(callback, value.xmlurl);
        }, this);
    }

    // Get data from cache
    _getMetaDataFromCache();
    _getStationDataFromCache();

    // TODO: Check for last-updated and update if neccesary
    //$timeout(_updateStationCacheLocal, 1000);
    this.updateMetaCache();
}

/**
 * Create Service
 */
freeradioapp.factory('DataService', function DataStorageFactory(DeferredWithUpdate, $rootScope, $http, XMLDataService) {
    return new DataService(DeferredWithUpdate, $rootScope, $http, XMLDataService);
 });