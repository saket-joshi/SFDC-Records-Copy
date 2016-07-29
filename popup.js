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
                console.log(sId);
            },
            function (err)
            {
                console.error(err);
            }
        );
    }
});