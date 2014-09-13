/*
 * FREIE RADIO APP
 * https://github.com/radiofreefm/freeradioapp/
 *
 * Scripts for the App
 */

'use strict';

/******************************
 *  Angular                   *
 ******************************/
var freeradioapp = angular.module('FreeRadioApp', ["DeferredWithUpdate", "FreeRadioApp.filters"]);
freeradioapp.constant('META_EXPIRATION_DAYS', 30);
freeradioapp.constant('STATION_EXPIRATION_DAYS', 7);
freeradioapp.constant('TIME_BETWEEN_UPDATES', 6000); // in ms


// INFO: edit categories here AND in the HTML pls
freeradioapp.constant('BROADCAST_CATEGORIES',
   [{ _id: 0, _name: "Alternative"},
    { _id: 1, _name: "Ambient"},
    { _id: 2, _name: "Classical"},
    { _id: 3, _name: "Country"},
    { _id: 4, _name: "Dance"},
    { _id: 5, _name: "Depp House"},
    { _id: 6, _name: "Disco"}
]);

// Trying to fix render-issues with jQuery-Mobile, not working really...
/*freeradioapp.directive('jqueryMobileTpl', function() {
  return {
    link: function(scope, elm, attr) {
      elm.trigger('create');
      console.log("jquery create");
    }
  };
});*/

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

    // Init all items dynamically created via angular.
    $("[data-role='listview']").listview().listview('refresh');
    //$("input[type='checkbox'").checkboxradio().checkboxradio( "refresh" );
});



