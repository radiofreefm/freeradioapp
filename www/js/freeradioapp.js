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
freeradioapp.constant('TIME_BETWEEN_UPDATES', 6000); // in ms


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

    console.log("Initialising jQuery.mobile components.")
    /* jQuery Mobile External Inits */
    //$("body>[data-role='header']").toolbar();
    $("body>[data-role='popup']").popup();

    // Init all lists, because they are dynamically created via angular.
    $("[data-role='listview']").listview().listview('refresh');
});



