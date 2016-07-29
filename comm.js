/**
* JS wrapper for performing RESTful callouts to Salesforce
*
* @author       Saket Joshi (https://github.com/saket-joshi)
* @version      1.0
*/

"use strict";

var SF_API_VERSION = "v35.0";

/**
* Method to get all objects information in the org
* To be used in the beginning of the extension to form the map
* of object key prefix and the API name
*
* @param        {string}        instanceUrl {URL Salesforce instance}
* @param        {string}        sessionId   {Session ID for the Salesforce instance}
* @param        {function}      done        {Success callback after getting URL}
* @param        {function}      fail        {Failure callback}
*/
var getAllObjectInformation = function (instanceUrl, sessionId, deferred, done, fail) {
    showProcessing();
    
    done = done || function () {};
    fail = fail || function () {};

    $.ajax({
        type: "GET",
        url: instanceUrl + "/services/data/" + SF_API_VERSION + "/sobjects",
        headers: {
            "Authorization": "OAuth " + sessionId
        }
    })
    .done(function (data) {
        var response = {};

        if (!data || !data.sobjects)
            done();

        for (var key in data.sobjects) {
            var objectInfo = data.sobjects[key];

            response[objectInfo.keyPrefix] = {
                name: objectInfo.name,
                isCustomSetting: objectInfo.customSetting,
                recordUrl: objectInfo.urls.rowTemplate
            };
        }

        done(response);
    })
    .fail(function (err) {
        fail(err);
    })
    .always(function () {
        hideProcessing();
    });
}