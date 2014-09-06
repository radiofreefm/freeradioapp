/*
 * FREIE RADIO APP
 * https://github.com/radiofreefm/freeradioapp/
 *
 * Scripts for the App
 */



/******************************
 *  Angular                   *
 ******************************/
var freeradioapp = angular.module('FreeRadioApp', ["DeferredWithUpdate"]);
freeradioapp.constant('META_EXPIRATION_DAYS', 30);
freeradioapp.constant('STATION_EXPIRATION_DAYS', 7);


/******************************
 *  HELPER                    *
 ******************************/
 String.prototype.hashCode = function() {
  return this.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);              
};


/******************************
 *  READY                     *
 ******************************/
$(document).ready(function(){

    /* jQuery Mobile External Inits */
    //$("body>[data-role='header']").toolbar();
    $("body>[data-role='popup']").popup();
});



