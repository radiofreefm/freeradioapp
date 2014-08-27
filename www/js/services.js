/*
 * FREIE RADIO APP
 * https://github.com/radiofreefm/freeradioapp/
 *
 * Services for Angular.js
 */

 freeradioapp.factory('SharedStationService', function($rootScope) {
    var sharedService = {};
    
    sharedService.url = '';

    sharedService.prepForBroadcast = function(url, name) {
        this.url = url;
        this.broadcastItem();
    };

    sharedService.broadcastItem = function() {
        $rootScope.$broadcast('handleBroadcast');
    };

    return sharedService;
});

freeradioapp.factory('MetaXMLService', ['$http', function($http){
	var metaXMLService = {};

	metaXMLService.get = function(callback){
        $http.get(
            'data/meta.xml',
            {transformResponse:function(data) {
              	// convert the data to JSON and provide
              	// it to the success function below
                // IMPORTANT: node name are converted to camelCase for JSON compatiblity!
                var x2js = new X2JS();
                var json = x2js.xml_str2json( data );
                return json;
                }
            }
        )
        .success(function(data, status) {
            // send the converted data back
            // to the callback function
            callback(data);
        })
        .error(function(data, status, headers, config) {
			// called asynchronously if an error occurs
			// or server returns response with an error status.
			callback(status);
	    });
   }

   return metaXMLService;
}]);
     
freeradioapp.factory('StationXMLService', ['$http', function($http){
	var stationXMLService = {};

	stationXMLService.get = function(callback, xmlurl){
        $http({
            method: 'GET',
            /* TODO: CORS problem with accessing remote xmls */
            url: "data/"+xmlurl.hashCode()+".xml",
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
            callback(data);
        })
        .error(function(data, status, headers, config) {
			// called asynchronously if an error occurs
			// or server returns response with an error status.
			callback(status);
	    });
    }

    return stationXMLService;
}]);