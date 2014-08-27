/*
 * FREIE RADIO APP
 * https://github.com/radiofreefm/freeradioapp/
 *
 * Scripts for the App
 */


/******************************
 *  READY                     *
 ******************************/
$(document).ready(function(){

    /* jQuery Mobile External Inits */
    $("body>[data-role='header']").toolbar();
    $("body>[data-role='popup']").popup();

    /* Load meta.xml for data-retreival */
    /*$.get('meta.xml',function(data){
        console.log(data);
    }, 'xml')
    .fail(function() {
        console.log("<ERROR> loading meta.xml.")
    });*/
});



