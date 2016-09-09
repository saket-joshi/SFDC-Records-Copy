/**
* Main entry point for the extension
*
* @author       Saket Joshi (https://github.com/saket-joshi)
* @version      1.0
*/

"use strict";

/**
* Method to initialize the event handlers
*/
var initializeEventHandlers = function () {
    // Find all the elements with the data-event attributes
    // Get the type of event handlers
    // Get the method name for the handler
    // Listen for this event on the element
    $("[data-event][data-listener]").each(function(index, el) {
        var event = $(el).attr("data-event");
        var listener = $(el).attr("data-listener");

        // Checking if the event and the listeners are sane
        if (event && listener && window[listener]) {
            $(el).on(event, window[listener]);
            $(el).removeAttr("disabled");
        } else if (!window[listener]) {
            console.error("Invalid listener specified: '", listener, "' for event: '", event , "' on element: ", el);
        }
    });
}

/**
* This is the main logic that needs to be executed on opening the extension
*/
$(function() {
    var url;
    var currentInstanceUrl;
    var describeInfo;

    // First check if this is a valid salesforce tab to clone the record
    (function() {
        getCurrentTabUrl(
            null,
            function (tabUrl) {
                if (getIfSalesforceUrl(tabUrl)) {
                    // This is a Salesforce.com tab
                    // ...so display the main panel
                    url = tabUrl;
                    currentInstanceUrl = getSalesforceInstanceUrl(tabUrl);
                    showElement("#body-panel");
                } else {
                    showMessage(MESSAGE_TYPE.ERROR, "Current tab is not a valid Salesforce.com tab");
                }
            },
            function (err) {
                showMessage(MESSAGE_TYPE.ERROR, err.message);
            }
        )
        .done(function (data) {
            // Once we get the Salesforce tab, get the session ID first
            getCookieValue(
                data.url,
                "sid",
                "value",
                null,
                null,
                function (err) {
                    showMessage(MESSAGE_TYPE.ERROR, err.message);
                }
            ).done(function (sessionId) {
                // After the session ID, get the describe info for all objects
                getAllObjectInformation(
                    currentInstanceUrl,
                    sessionId,
                    null,
                    function (objectInfo) {
                        describeInfo = objectInfo;
                    },
                    function (err) {
                        showMessage(MESSAGE_TYPE.ERROR, err.message);
                    }
                )
            })

            // Now we are done with the routine work...
        });
    })();
});



/*$(function() {
    var url;

    var getUrl = getCurrentTabUrl(
        null,
        function (tabUrl) {
            url = tabUrl;
            getCookie();
        },
        function (err) {
            console.error(err);
        }
    );
    
    var getCookie = function () {
            getCookieValue (
            url,
            "sid",
            "value",
            null,
            function (sId) {
                console.log(sId);
                getAllObjectInformation(
                    getSalesforceInstanceUrl(url),
                    sId,
                    null,
                    function (data) {
                        getObjectData(
                            data,
                            getSalesforceInstanceUrl(url),
                            sId,
                            getCurrentRecordId(url),
                            function (data) {
                                console.log(data);
                            },
                            function (err) {
                                console.error(err);
                            }
                        );
                    },
                    function (err) { console.error(err) }
                );
            },
            function (err)
            {
                console.error(err);
            }
        );
    }
});*/