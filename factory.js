/**
* JS factory that provides means of communication
* within the browser tabs as well as with Salesforce
* 
* @author       Saket Joshi (https://github.com/saket-joshi)
* @version      1.0
*/

"use strict";

/**
* Method to get the URL for the current tab
* @param        {function}      callback      {Callback function executed after getting the tab URL}
*/
var getCurrentTabUrl = function (callback) {
    if (!callback && typeof callback != "function")
        return;

    var tabProperties = {
        active: true,
        currentWindow: true
    };

    chrome.tabs.query(tabProperties, function (tabs) {
        if (tabs.length > 1)
            return;
        callback(tabs[0].url);
    });
}

/**
* Method to get whether the current tab URL is a Salesforce instance URL
* @param        {string}        url         {URL to be checked}
*/
var getIfSalesforceUrl = function (url) {
    if (!url)
        return false;

    // Eventually this will match for both *.force.com pages as well as *.salesforce.com pages
    return url.indexOf("force.com") != -1;
}

/**
* Method to get the full salesforce instance URL
* @param        {string}        url         {Salesforce page URL}
*/
var getSalesforceInstanceUrl = function (url) {
    if (!getIfSalesforceUrl(url))
        return;

    var splitUrl;
    var protocol = url.split("/")[0];

    if (url.indexOf("https://") != -1)
        splitUrl = url.split("https://")[1];
    
    if (url.indexOf("http://") != -1)
        splitUrl = url.split("http://")[1];

    return protocol + "//" +   splitUrl.substring(0, splitUrl.indexOf("/"));
}

/**
* Method to get the ID of the record from the URL provided
* @param        {string}        url         {Salesforce page URL}
*/
var getCurrentRecordId = function (url) {
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
* @param        {function}      callback    {Callback function that is executed after cookie is found}
*/
var getCookieValue = function (url, name, prop, callback) {
    if (!url)
        return;

    if (!name)
        return;

    if (!callback && typeof callback != "function")
        return;

    var cookieProperties = {
        url: url,
        name: name
    };

    chrome.cookies.get(cookieProperties, function(cookie) {
        if (!cookie && !cookie[prop])
            return;

        callback(cookie[prop]);
    });
}