/*
 * FREIE RADIO APP
 * https://github.com/radiofreefm/freeradioapp/
 *
 * Controllers for Angular.js
 */


freeradioapp.controller('MetaController', function ($scope, MetaXML) {
	//This is the callback function
    setData = function(data) {
        $scope.meta = data.freeradioapp;
        console.log(data);
    }
         
    MetaXML.get(setData);
});