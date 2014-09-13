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
 * CacheService to save cache data onto the phone.
 */
function CacheService() {
    var _that = this;
    this.isInitalized = false;

    var _store = new Lawnchair({name:'Free Radio App'}, function(store) {
        //init
        _that.isInitalized = true;
    });

    /**
     * Delete local cache
     */
    this.reset = function(){
        // currently bugged!
        //_store.nuke();

        // hardcoded fix
        _store.remove('meta_cache.json');
        _store.remove('stations_cache.json');
        _store.remove('favorites.json');
    }

    /**
     * Checks if file is in persistent storage
     */
    this.fileExists = function(filename, callback) {
        _store.exists(filename, callback);
    }

    /**
     * Get File from perstistent storage
     */
    this.getFile = function(filename, callback) {
        _store.get(filename, callback)
    }

    /**
     * Save data into file (and create file if necessary).
     */
    this.saveFile = function(filename, data, callback) {
        _store.save({key:filename, data:data}, callback);
    }
}

/**
 * Create Service
 */
freeradioapp.factory('CacheService', function CacheServiceFactory() {
    return new CacheService();
});


/**
 * FileSystemService to save and load persistent data from the phone.
 * INFO: not used, because complicated!
 */
function FileSystemService($http, $q, $log) {
    var _directory = LocalFileSystem.PERSISTENT;
    var _fs = null;
    var _that = this;

    this.isInitalized = false;

    function errorHandler(e) {
      var msg = '';

      switch (e.code) {
        case FileError.QUOTA_EXCEEDED_ERR:
          msg = 'QUOTA_EXCEEDED_ERR';
          break;
        case FileError.NOT_FOUND_ERR:
          msg = 'NOT_FOUND_ERR';
          break;
        case FileError.SECURITY_ERR:
          msg = 'SECURITY_ERR';
          break;
        case FileError.INVALID_MODIFICATION_ERR:
          msg = 'INVALID_MODIFICATION_ERR';
          break;
        case FileError.INVALID_STATE_ERR:
          msg = 'INVALID_STATE_ERR';
          break;
        default:
          msg = 'Unknown Error';
          break;
      };

      $log.error('FileSystemService: ' + msg);
    }

    // startup
    window.requestFileSystem(_directory, 0, function(fs){
        _fs = fs;
        _that.isInitalized = true;
    }, errorHandler);


    /**
     * Checks if file is in persistent storage
     */
    this.fileExists = function(filename) {
        // fs not initialised
        if(!_that.isInitalized)
            return;
        //var uri = _directory + "/" + filename;
        //return $http.get(uri);
        var deferred = $q.defer();

        _fs.root.getFile(filename, {}, function(fileEntry) {
            // Get a File object representing the file,
            // then use FileReader to read its contents.
            fileEntry.file(function(file) {
                var reader = new FileReader();

                reader.onloadend = function(e) {
                    deferred.resolve(e.target.result);
                };

                reader.readAsDataURL(file);
            }, errorHandler);
        }, errorHandler);

        return deferred.promise;
    }

    /**
     * Get File from perstistent storage
     */
    this.getFile = function(filename) {
        // fs not initialised
        if(!_that.isInitalized)
            return;
        //var uri = _directory + "/" + filename;
        //return $http.get(uri);
        var deferred = $q.defer();

        _fs.root.getFile(filename, {}, function(fileEntry) {
            // Get a File object representing the file,
            // then use FileReader to read its contents.
            fileEntry.file(function(file) {
                var reader = new FileReader();

                reader.onloadend = function(e) {
                    deferred.resolve(e.target.result);
                };

                reader.readAsDataURL(file);
            }, errorHandler);
        }, errorHandler);

        return deferred.promise;
    }

    /**
     * Save data into file (and create that if necessary).
     */
    this.saveFile = function(filename, data) {
        // fs not initialised
        if(!_that.isInitalized)
            return;

        var deferred = $q.defer();

        _fs.root.getFile(filename, {create: true}, function(fileEntry) {
            // Create a FileWriter object for our FileEntry (log.txt).
            fileEntry.createWriter(function(fileWriter) {

                fileWriter.onwriteend = function(e) {
                    $log.log('Write completed.');
                    deferred.resolve();
                };

                fileWriter.onerror = function(e) {
                    deferred.reject(e);
                    $log.error('FileSystemService: write failed, ' + e.toString());
                };

                // Create a new Blob and write it to log.txt.
                var blob = new Blob([data], {type: 'text/plain'});

                fileWriter.write(blob);

            }, errorHandler);
        }, errorHandler);

        return deferred.promise;
    }
}

/**
 * Create Service
 */
freeradioapp.factory('FileSystemService', function FileSystemServiceFactory($http, $q, $log) {
    //return new FileSystemService($http, $q, $log);
    return function() {/* I am empty, sorry. */};
});


/**
 * XMLDataService to access remote and local xml-files.
 * These files will then be transformed into json-objects for use in angular.
 */
freeradioapp.factory('XMLDataService', function($log, $q, $http){
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
                // INFO: node names are converted to camelCase for JSON compatiblity!
                var x2js = new X2JS();
                var json = x2js.xml_str2json( data );
                return json;
            }
        });
    }

    xmlDataService.getLocal = function(filename) {

        return $http({
            method: 'GET',
            /* TODO: CORS problem with accessing remote xmls */
            url: "data/" + filename,
            transformResponse:function(data) {
                // convert the data to JSON and provide
                // it to the success function below
                // INFO: node names are converted to camelCase for JSON compatiblity!
                var x2js = new X2JS();
                var json = x2js.xml_str2json( data );
                return json;
            }
        });
        /*
        var deferred = $q.defer();

        FileSystemService.getFile(filename)
        .then(function(data) {
            // convert to JSON
            var x2js = new X2JS();
            var json = x2js.xml_str2json( data );
            deferred.resolve(json);
        },function(e){
            deferred.reject();
            $log.warn("XMLDataService: No local file '" + filename + "' found.")
        });

        return deferred.promise;*/
    }

   return xmlDataService;
});



/**
 * DataService functions as a backend data-caching and -updating service.
 */
function DataService(DeferredWithUpdate, $log, $rootScope, $q, $http, XMLDataService, FileSystemService, CacheService, STATION_EXPIRATION_DAYS, META_EXPIRATION_DAYS, TIME_BETWEEN_UPDATES) {
    var _that = this;                                   // internal reference on instance, due to JS scopes
    var _metaDeferred = DeferredWithUpdate.defer();     // deferred object, see: https://docs.angularjs.org/api/ng/service/$q
    _metaDeferred.resolve({}); // dont know why we need this :(
    
    var _metaData = {};                          // class-internal storage for data
    var _metaDataPromise = _metaDeferred.promise;       // external data-promise for update-purposes
    var _lastMetaDataUpdate;                            // save last update, to prevent infinite loops

    var _stationDeferred = DeferredWithUpdate.defer();  // deferred object, see: https://docs.angularjs.org/api/ng/service/$q
    _stationDeferred.resolve({}); // dont know why we need this :(

    var _stationData = {stations:{}};                       
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
        function callback(result){
            //var data = JSON.parse(result.data);
            _setMetaData(result.data.freeradioapp);
        }

        CacheService.getFile("meta_cache.json", callback);

        // INFO: filesystem-tests
        // FileSystemService.getFile("meta_cache.json")
        // .then(function(response){
        //     _setMetaData(response.freeradioapp);
        // }, function(e){
        //     $log.error("DataService: Local acces of cached meta-file failed: " + e);
        // });
    }

    /**
     * Update metadata json-cache from local xml-file
     */
    var _updateMetaCacheLocal = function() {
        XMLDataService.getLocal("meta.xml")
        .success(function(response){
            // INFO: filesystem-tests
            // FileSystemService.saveFile("meta_cache.json", JSON.stringify(response))
            // .then(function(){
            //     _getMetaDataFromCache();
            // });

            function callback(result){
                //var data = JSON.parse(result.data);
                _setMetaData(result.data.freeradioapp);
            }

            CacheService.saveFile("meta_cache.json", response, callback);
        })
        .error(function(e){
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
        // INFO: filesystem-tests
        // FileSystemService.getFile("stations_cache.json")
        // .then(function(response){
        //     _setStationData(response);
        // }, function(e){
        //     $log.error("DataService: Access of cached station-file failed: " + e);
        // });

        function callback(result){
            //var data = JSON.parse(result.data);
            _setMetaData(result);
        }

        CacheService.getFile("stations_cache.json", callback);
    }

    /**
     * Update stationdata lcoal json-cache from local xml-files
     */
    var _updateStationCacheLocal = function() {
        if(_that.getMetaData() == undefined) {
            _updateMetaCacheLocal();
            return;
        }

        var data = _stationData;
        var promises = [];

        angular.forEach(_metaData.stationlist.station, function(value, key) {
            promises.push(XMLDataService.getLocal(value.name.hashCode()+".xml")
            .success(function(response) {
                data.stations[response.station.info.fullname] = response;
                //DataService.saveFile("stations_cache.json", response);
            })
            .error(function(e) {
                $log.error("DataService: Local access of local station-xml failed: " + e);
            }));
        }, _that);

        $q.all(promises)['finally'](function(responses){
            function callback(result){
                //var data = JSON.parse(result.data);
                _setStationData(result.data);
            }

            CacheService.saveFile("stations_cache.json", data, callback);
        });
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
            function callback(result){
                _setMetaData(result.freeradioapp);
            }

            CacheService.saveFile("meta_cache.json", JSON.stringify(response), callback);
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
        var data = _stationData;

        angular.forEach(_metaData.stationlist.station, function(value, key) {
            // only update if needed or forced
            if(forceRefresh || _isStationDataExpired(value._id)) {
                promises.push(XMLDataService.getRemote(value.xmluri)
                    .success(function(response) {
                        data.stations[response.station.info.fullname] = response;
                    })
                    .error(function(e) {
                        $log.error("DataService: Local access of local station-xml failed: " + e);
                    })
                );
            }
        });

        $q.all(promises)['finally'](function(responses){
            function callback(result){
                //var data = JSON.parse(result.data);
                _setStationData(result.data);
            }

            CacheService.saveFile("stations_cache.json", data, callback);
        });
    }

    this.init = function() {
        // init with cache data
        CacheService.fileExists('meta_cache.json', function(exists){
            if(!exists) {
                $log.log('DataService: no meta cache data found, loading from local xmls.');
                _updateMetaCacheLocal();
            }
            else {
                $log.log('DataService: cache meta data found.')
                _getMetaDataFromCache();
            }
        });

        // update the stationscache later
        setTimeout(_updateStationCacheLocal, 500);
    }
}

/**
 * Create Service
 */
freeradioapp.factory('DataService', function DataStorageFactory(DeferredWithUpdate, $log, $rootScope, $q, $http, XMLDataService, FileSystemService, CacheService) {
    return new DataService(DeferredWithUpdate, $log, $rootScope, $q, $http, XMLDataService, FileSystemService, CacheService);
 });



/**
 * FavoriteService to save and load favorites.
 */
function FavoriteService($http, $q, FileSystemService, CacheService, DeferredWithUpdate) {
    var _data = undefined;
    var _deferred = DeferredWithUpdate.defer();
    _deferred.resolve({});
    var _that = this;

    this.init = function() {
        CacheService.fileExists('favorites.json', function(exists){
            if(!exists) {
                CacheService.saveFile(
                    'favorites.json',
                    {"_lastupdate": "2013-08-21T15:07:38.6875000+02:00", "stations": [{"_id": "0","name": "Radio StHörfunk"},{"_id": "1","name": "Free FM"}],"broadcasts": [{"_stationid": "0","name": "Testsendung"}]},
                    function(){
                        _loadFavorites();
                    }
                );
            }
            else {
                console.log('FavoriteService: cache data found.');
                _loadFavorites();
            }
        });
    }

    _setFavorites = function(data) {
        _data = data;
        _deferred.resolve(data);
    }

    _loadFavorites = function() {
        /*if(FileSystemService.isInitalized) {
            FileSystemService.getFile("userdata.json").then(function(data){
                deferred.resolve(data);
                //console.table($scope.favorites);
            }, function(e){
                deferred.reject(e);
            });
        }
        else{
            setTimeout(_that.loadFavorites, 1000);
        }*/

        CacheService.getFile('favorites.json', function (result){
            //var data = JSON.parse(results.data);
            _setFavorites(result.data);
        });
    }

    this.getFavorites = function() {
        return _deferred.promise;
    }

    this.addFavorite = function(data, type) {
        // TODO: implement
    }

    this.removeFavorite = function(fav, type) {
        // TODO: implement
    }
}

/**
 * Create Service
 */
freeradioapp.factory('FavoriteService', function FavoriteServiceFactory($http, $q, FileSystemService, CacheService, DeferredWithUpdate) {
    return new FavoriteService($http, $q, FileSystemService, CacheService, DeferredWithUpdate);
 });