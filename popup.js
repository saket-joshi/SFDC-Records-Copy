"use strict";

$(function() {
    getCurrentTabUrl(function (url) {
        console.log(getCurrentRecordId(url), "asdada");
        // getCookieValue(
        //     getSalesforceInstanceUrl(url),
        //     "sid",
        //     "value",
        //     function (value) {
        //         console.log(value);
        //     }
        // );
    });
});