/*
 * FREIE RADIO APP
 * https://github.com/radiofreefm/freeradioapp/
 *
 * Scripts for the App
 */

 function isParseError(parsedDocument) {
    // parser and parsererrorNS could be cached on startup for efficiency
    var parser = new DOMParser(),
        errorneousParse = p.parseFromString('<', 'text/xml'),
        parsererrorNS = errorneousParse.getElementsByTagName("parsererror")[0].namespaceURI;

    if (parsererrorNS === 'http://www.w3.org/1999/xhtml') {
        // In PhantomJS the parseerror element doesn't seem to have a special namespace, so we are just guessing here :(
        return parsedDocument.getElementsByTagName("parsererror").length > 0;
    }

    return parsedDocument.getElementsByTagNameNS(parsererrorNS, 'parsererror').length > 0;
};

/* Helper function for parsing Meta-XML, from: http://goessner.net/download/prj/jsonxml/ */
function parseXml(xml) {
    var dom = null;

    if (window.DOMParser) {
        try { 
            var parser = new DOMParser();
            dom = parser.parseFromString(xml, "text/xml");

            if(isParseError(dom)) {
                throw new Error('Error parsing XML');
            }
        } 
        catch (e) {
            dom = null;
        }
    }
    else if (window.ActiveXObject) {
        try {
            dom = new ActiveXObject('Microsoft.XMLDOM');
            dom.async = true;

            if (!dom.loadXML(xml)) {
                // parse error ..
                console.log(dom.parseError.reason + dom.parseError.srcText);
            }
        } 
        catch (e) {
            dom = null;
        }
    }
    else {
        alert("cannot parse xml string!");
    }

    return dom;
}

$(document).ready(function(){

    /* jQuery Mobile External Inits */
    $("[data-role='header']").toolbar();
    $("[data-role='panel']").panel();
    $("[data-role='popup']").popup();

    var xml = null,
        json = null;

    $.get('meta.xml',function(data){/// get the xml data from test.xml
        console.log(data);
        xml = parseXml(data);
        json = xml2json(xml);
    })
    .fail(function() {
        console.log("<ERROR> loading meta.xml.")
    });
});



