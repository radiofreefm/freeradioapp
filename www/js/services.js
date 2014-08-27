/*
 * FREIE RADIO APP
 * https://github.com/radiofreefm/freeradioapp/
 *
 * Services for Angular.js
 */

angular.module('FreeRadioApp.service',[]).
    factory('MetaXML', ['$http', function($http){
       return {
           get: function(callback){
                $http.get(
                    'meta.xml',
                    {transformResponse:function(data) {
                      	// convert the data to JSON and provide
                      	// it to the success function below
                        var x2js = new X2JS();
                        var json = x2js.xml_str2json( data );
                        return json;
                        }
                    }
                ).
                success(function(data, status) {
                    // send the converted data back
                    // to the callback function
                    callback(data);
                })
           }
       }
    }]);
     
var freeradioapp = angular.module('FreeRadioApp', ['FreeRadioApp.service']);