/**
* Main entry point for the extension
*
* @author       Saket Joshi (https://github.com/saket-joshi)
* @version      1.0
*/

"use strict";

$(function() {
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
});