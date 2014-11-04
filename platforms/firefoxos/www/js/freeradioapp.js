/*
 * FREIE RADIO APP
 * https://github.com/radiofreefm/freeradioapp/
 *
 * Scripts for the App
 */

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
    $("body>[data-role='header']").toolbar();
    $("body>[data-role='popup']").popup();
});

/******************************
 *  Angular                   *
 ******************************/
var freeradioapp = angular.module('FreeRadioApp', []);



