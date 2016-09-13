/**
* JS factory that provides means of communication
* within the browser tabs
* 
* @author       Saket Joshi (https://github.com/saket-joshi)
* @version      1.2
*/

"use strict";

var RECORD_KEY = "RECORD_KEY";

/**
* Method to get the URL for the current tab
* @param        {function}      deferred  {Deferred object from previous async}
* @param        {function}      done      {Success callback after getting URL}
* @param        {function}      fail      {Failure callback}
*/
function getCurrentTabUrl(deferred, done, fail) {
    var tabProperties = {
        active: true,
        currentWindow: true
    };

    // Sanity check
    deferred = deferred || new $.Deferred(showProcessing());
    done = done || function () {};
    fail = fail || function () {};

    // Callback for successful URL fetch
    deferred.done(function (tab) {
        done(tab.url);
    });

    // Callback for failed URL fetch
    deferred.fail(function (err) {
        fail(err);
    })

    // Hide the processing window
    deferred.always(function () {
        hideProcessing();
    });

    try {
        chrome.tabs.query(tabProperties, function (tabs) {
            var response = [];
            if (tabs && tabs.length > 0)  {
                response = tabs[0];
            }

            // Got the URLs, resolve the promise
            deferred.resolve(response);
        });
    } catch (exception) {
        // Oops! Reject the promise
        deferred.reject(exception)
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
* @param        {string}        url         {URL for which the cookie needs to be retrieved}
* @param        {string}        name        {Name of the cookie}
* @param        {string}        prop        {Property to get}
* @param        {function}      deferred    {Deferred object from previous async}
* @param        {function}      done        {Success callback after getting URL}
* @param        {function}      fail        {Failure callback}
*/
function getCookieValue(url, name, prop, deferred, done, fail) {
    var cookieProperties = {
        url: url,
        name: name
    };

    // Sanity check
    // @TODO: Need to check if this param is required...
    // ...if the function can be called from another async internally
    // ...instead of calling it on the resolution of previous function
    deferred = deferred || new $.Deferred(showProcessing());

    done = done || function () {};
    fail = fail || function () {};
    
    deferred.done(function (value) {
        done(value);
    });

    deferred.fail(function (err) {
        fail(err);
    });

    deferred.always(function () {
        hideProcessing();
    });

    try {
        chrome.cookies.get(cookieProperties, function(cookie) {
            if (cookie) {
                deferred.resolve(cookie[prop]);
            }
            deferred.reject(null);
        });
    } catch (exception) {
        deferred.reject(exception);
    }

    return deferred.promise();
}

/**
* Method to store the record data in Chrome Extension storage space
* @param        {object}        recordToStore   {Record to store}
* @param        {function}      deferred        {Deferred object from previous async}
* @param        {function}      done            {Successful callback}
* @param        {function}      fail            {Failure callback}
*/
function storeRecord(recordToStore, deferred, done, fail) {
    
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
        { RECORD_KEY: recordToStore },
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
        RECORD_KEY,
        function(record) {
            if (record) {
                // Once the record has been found, clear the space
                // ...so that the next record can be stored here
                chrome.storage.local.remove(RECORD_KEY);
                deferred.resolve(record);
            }
            else {
                deferred.reject(null);
            }
        }
    );

    return deferred.promise();
}