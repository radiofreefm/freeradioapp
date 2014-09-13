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

/**
 * FileSystemService to save data onto the phone.
 * Used to update cache-files.
 * TODO: update to phonegap file-service.
 */
function FileSystemService($http) {
    var _folder = "data";

    // TODO: change to phonegap filesystem
    this.getFile = function(filename) {
        var uri = _folder + "/" + filename;
        return $http.get(uri);
    }

    this.saveFile = function(name, data) {
        // TODO: implement
        console.log(JSON.stringify(data));
    }
}

/**
 * Create Service
 */
freeradioapp.factory('FileSystemService', function FileSystemServiceFactory($http) {
    return new FileSystemService($http);
 });


/**
 * XMLDataService to access remote and local xml-files.
 * These files will then be transformed into json-objects for use in angular.
 */
freeradioapp.factory('XMLDataService', function($log, $q, $http, FileSystemService){
	var xmlDataService = {};

	xmlDataService.getRemote = function(xmlurl){

        // get remote file
        return $http({
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
        });
    }

    xmlDataService.getLocal = function(filename) {
        var deferred = $q.defer();

        FileSystemService.getFile(filename)
        .success(function(data) {
            var x2js = new X2JS();
            var json = x2js.xml_str2json( data );
            deferred.resolve(json);
        })
        .error(function(e){
            deferred.reject();
            $log.warn("XMLDataService: No local file '" + filename + "' found.")
        });
        return deferred.promise;
    }

   return xmlDataService;
});



/**
 * DataService functions as a backend data-caching and -updating service.
 */
function DataService(DeferredWithUpdate, $log, $rootScope, $q, $http, XMLDataService, FileSystemService, STATION_EXPIRATION_DAYS, META_EXPIRATION_DAYS, TIME_BETWEEN_UPDATES) {
    var _that = this;                                   // internal reference on instance, due to JS scopes
    var _metaDeferred = DeferredWithUpdate.defer();     // deferred object, see: https://docs.angularjs.org/api/ng/service/$q
    _metaDeferred.resolve({}); // dont know why we need this :(
    
    var _metaData = undefined;                          // class-internal storage for data
    var _metaDataPromise = _metaDeferred.promise;       // external data-promise for update-purposes
    var _lastMetaDataUpdate;                            // save last update, to prevent infinite loops

    var _stationDeferred = DeferredWithUpdate.defer();  // deferred object, see: https://docs.angularjs.org/api/ng/service/$q
    _stationDeferred.resolve({}); // dont know why we need this :(

    var _stationData = undefined;                       
    var _stationDataPromise = _stationDeferred.promise;
    var _lastStationDataUpdate;

    /**
     * Set new meta data.
     * This will fire a broadcast.
     */
    var _setMetaData = function(data) {
        _metaData = data;
        _metaDeferred.resolve(data);
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
        FileSystemService.getFile("meta_cache.json")
        .success(function(response){
            _setMetaData(response.freeradioapp);
        })
        .error(function(e){
            $log.error("DataService: Local acces of cached meta-file failed: " + e);
        });
    }

    /**
     * Update metadata json-cache from local xml-file
     */
    var _updateMetaCacheLocal = function() {
        XMLDataService.getLocal("meta.xml")
        .then(function(response){
            // TODO: save into .json-file
            _getMetaDataFromCache();
        }, function(e){
            $log.error("DataService: Local access of 'meta.xml' failed: " + e);
        });
    }

    /**
     * Set new station data.
     * This will fire a broadcast.
     */
    var _setStationData = function(data) {
        _stationData = data;
        _stationDeferred.resolve(data);
    }

    /**
     * Check if stationdata of given station is expired.
     */
    var _isStationDataExpired = function(id) {
        if(!_stationData || !_stationData.stations[id])
            return true;

        var stationLastUpdated = new Date(_stationData.stations[id].station._lastupdate);
        var now = Date.now();

        if(Math.round(Math.abs((now - stationLastUpdated)/(72000000))) > STATION_EXPIRATION_DAYS) {
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
        FileSystemService.getFile("stations_cache.json")
        .success(function(response){
            _setStationData(response);
        })
        .error(function(e){
            $log.error("DataService: Access of cached station-file failed: " + e);
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

        angular.forEach(_that.getStationData().stations, function(value, key) {
            XMLDataService.getLocal(value.station.info.fullname.hashCode()+".xml")
            .then(function(response) {
                // TODO: save into .json-file
                //DataService.saveFile("stations_cache.json", response);
            }, function(e) {
                $log.error("DataService: Local access of local station-xml failed: " + e);
            });
        }, _that);
    }

    /*
     * PUBLIC METHODS
     */

    /**
     * Returns metadata-promise
     */
    this.getMetaData = function() {
        return _metaDataPromise;
    }

    /**
     * Updates metacache from remote xml-file expired.
     * forceRefresh: if true will refresh even if not neede
     */
    this.updateMetaData = function(forceRefresh) {
        if(!forceRefresh && !_isMetaDataExpired)
            return;

        if((Date.now() - _lastMetaDataUpdate) < TIME_BETWEEN_UPDATES)
            return;

        _lastMetaDataUpdate = Date.now();

        //TODO: change remote-access url;
        XMLDataService.getRemote("data/meta-demo.xml")
        .success(function(response){
            _setMetaData(response.freeradioapp);
        })
        .error(function(e){
            $log.error("DataService: Remote access of meta.xml failed:" + e);
        });
    }


    /**
     * Returns current station data.
     */
    this.getStationData = function() {
        return _stationDataPromise;
    }

    this.updateDataForStation = function(id, data) {
        if(data == undefined || id == undefined)
            $log.error("DataService: no id or data provided.")
            return;
        
        // deep copy
        var stationdata = JSON.parse(JSON.stringify(_stationData));

        // update local stationdata
        stationdata.stations.station[id] = data

        // set new data
        _setStationData(stationdata);

        // TODO: save station-data into cache-json
        FileSystemService.saveFile("stations_cache.json", _stationData.)
    }
    
    /**
     * Updates stationscache from remote xml-files if expired.
     * forceRefresh: if true will refresh even if not needed.
     */
    this.updateStationData = function(forceRefresh) {
        $log.log("trying to update stationData: " + ((Date.now() - _lastStationDataUpdate) < TIME_BETWEEN_UPDATES));
        var promises = [];

        if(!_metaData || (Date.now() - _lastStationDataUpdate) < TIME_BETWEEN_UPDATES)
            return;
        
        _lastStationDataUpdate = Date.now();

        angular.forEach(_metaData.stationlist.station, function(value, key) {
            // only update if needed or forced
            if(forceRefresh || _isStationDataExpired(value._id)) {
                promises.push(XMLDataService.getRemote(value.xmluri));
            }
        });

        $q.all(promises)
        .then(function(responses) {
            //TODO: update chache
        }, function(e){
            $log.warn(e);
        });
    }

    // init with cache data
    _getMetaDataFromCache();
    _getStationDataFromCache();
}

/**
 * Create Service
 */
freeradioapp.factory('DataService', function DataStorageFactory(DeferredWithUpdate, $log, $rootScope, $q, $http, XMLDataService, FileSystemService) {
    return new DataService(DeferredWithUpdate, $log, $rootScope, $q, $http, XMLDataService, FileSystemService);
 });



/**
 * FavoriteService to save and load favorites.
 */
function FavoriteService($http, $q, FileSystemService) {
    var _data = undefined;

    this.loadFavorites = function() {
        var deferred = $q.defer();
        FileSystemService.getFile("userdata.json").success(function(data){
            deferred.resolve(data);
            //console.table($scope.favorites);
        })
        .error(function(e){
            deferred.reject(e);
        })
        return deferred.promise;
    }

    this.addFavorite = function(data) {
        // TODO: implement
    }

    this.removeFavorite = function(name, data) {
        // TODO: implement
    }
}

/**
 * Create Service
 */
freeradioapp.factory('FavoriteService', function FavoriteServiceFactory($http, $q, FileSystemService) {
    return new FavoriteService($http, $q, FileSystemService);
 });