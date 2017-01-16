/**
* JS factory that provides means of communication
* within the browser tabs
* 
* @author       Saket Joshi (https://github.com/saket-joshi)
* @version      2.0
*/

"use strict";

var RECORD_KEY = "RECORD_KEY";
var OBJECT_API_NAME = "OBJECT_API_NAME";

/**
* Chrome API method to get the current tab URL
*
* @note     Method returns deferred promise for further chaining
*/
function getCurrentTabUrl() {
    var deferred = $.Deferred();
    var tabProperties = {
        active: true,
        currentWindow: true
    };

    try {
        chrome.tabs.query(tabProperties, function (tabs) {
            var response = [];
            if (tabs && tabs.length > 0)  {
                response = tabs[0];
            }

            // Got the URLs, resolve the promise
            deferred.resolve(response.url);
        });
    } catch (error) {
        // Oops! Reject the promise
        deferred.reject(error)
    }

    return deferred.promise();
}

/**
* Method to get whether the current tab URL is a Salesforce instance URL
* @param        {string}        url         {URL to be checked}
*/
function getIfSalesforceUrl(url) {
    if (!url)
        return false;

    // Eventually this will match for both *.force.com pages as well as *.salesforce.com pages
    return url.indexOf("force.com") != -1;
}

/**
* Method to get the full salesforce instance URL
* @param        {string}        url         {Salesforce page URL}
*/
function getSalesforceInstanceUrl(url) {
    if (!getIfSalesforceUrl(url))
        return;

    var splitUrl = url.split("/");
    var protocol = splitUrl[0];

    if (splitUrl[2].indexOf(".salesforce.com") != -1)
        return protocol + "//" + splitUrl[2];

    if (splitUrl[2].indexOf(".force.com") != -1)
        return protocol + "//" + splitUrl[2].split(".")[1] + ".salesforce.com";
}

/**
* Method to get the ID of the record from the URL provided
* @param        {string}        url         {Salesforce page URL}
*/
function getCurrentRecordId(url) {
    var instanceUrl = getSalesforceInstanceUrl(url);
    
    if (url.indexOf("#") != -1) {
        var completeUrl = url.substring(0, url.indexOf("#"));
        return completeUrl.split(instanceUrl + "/")[1];
    }

    return url.split(instanceUrl + "/")[1];
}

/**
* Method to get a cookie value from the cookie store
* @param        {string}        name        {Name of the cookie}
* @param        {string}        prop        {Property to get}
* @param        {string}        url         {URL for which the cookie needs to be retrieved}
*/
function getCookieValue(name, prop, url) {
    var deferred = $.Deferred();

    // If any of the values is not provided, there's no use of wasting time
    if (!name || !prop || !url) {
        deferred.reject();
        return deferred.promise();
    }

    // Build the query properties
    var queryProp = {
        url: url,
        name: name
    };

    try {
        // Fetch the cookie from Chrome cookie store
        chrome.cookies.get(cookieProperties, function(cookie) {
            if (cookie) {
                deferred.resolve(cookie[prop]);
            }

            // If cookie not found then reject the promise
            // ...instead of returning a success with null value
            deferred.reject(null);
        });
    } catch (error) {
        deferred.reject(error);
    }

    return deferred.promise();
}

/**
* Method to store the record data in Chrome Extension storage space
* @param        {object}        recordToStore   {Record to store}
* @param        {string}        apiName         {API name of object so as to use it to insert in destn org}
* @param        {function}      deferred        {Deferred object from previous async}
* @param        {function}      done            {Successful callback}
* @param        {function}      fail            {Failure callback}
*/
function storeRecord(recordToStore, apiName, deferred, done, fail) {
    
    deferred = deferred || new $.Deferred(showProcessing());
    done = done || function() {};
    fail = fail || function() {};

    deferred.done(function(data) {
        done(data);
    });

    deferred.fail(function(err) {
        fail(err);
    });

    deferred.always(function() {
        hideProcessing();
    });

    chrome.storage.local.set(
        {
            RECORD_KEY: recordToStore,
            OBJECT_API_NAME: apiName
        },
        function() {
            deferred.resolve(true);
        }
    );

    return deferred.promise();
}

/**
* Method to fetch the record data in Chrome Extension storage space
* @param        {function}      deferred        {Deferred object from previous async}
* @param        {function}      done            {Successful callback}
* @param        {function}      fail            {Failure callback}
*/
function fetchRecord(deferred, done, fail) {
    
    deferred = deferred || new $.Deferred(showProcessing());
    done = done || function() {};
    fail = fail || function() {};

    deferred.done(function(data) {
        done(data);
    });

    deferred.fail(function(err) {
        fail(err);
    });

    deferred.always(function() {
        hideProcessing();
    });

    chrome.storage.local.get(
        [
            RECORD_KEY,
            OBJECT_API_NAME
        ],
        function(record) {
            console.log(record);
            if (record) {
                // Once the record has been found, clear the space
                // ...so that the next record can be stored here
                chrome.storage.local.remove([
                    RECORD_KEY,
                    OBJECT_API_NAME
                ]);
                deferred.resolve(record);
            }
            else {
                deferred.reject(null);
            }
        }
    );

    return deferred.promise();
}