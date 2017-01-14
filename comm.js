/**
* JS wrapper for performing RESTful callouts to Salesforce
*
* @author       Saket Joshi (https://github.com/saket-joshi)
* @version      2.0
*/

"use strict";

/**
* Reusable function for all AJAX requests
*
* @help     ajaxParams      Object
*   AJAX_PARAM_URL          String                  URL of the AJAX request
*   AJAX_PARAM_METHOD       String                  Type of the AJAX request
*   AJAX_PARAM_HEADERS      Object (key => value)   Headers to be sent
*   AJAX_PARAM_BODY         JSON String             JSON Body for POST requests
*   AJAX_PARAM_QUERY        Object (key => value)   Query string params for GET requests
*
* @note Method returns the AJAX object directly for multiple AJAX chaining
*/
function doAjax(ajaxParams, isShowProcess) {
    isShowProcess = isShowProcess || false; 

    if (isShowProcess) {
        showProcessing();
    }

    // Form the final URL for GET type of requests
    var finalUrl = ajaxParams["AJAX_PARAM_URL"];
    if (ajaxParams["AJAX_PARAM_QUERY"]) {
        finalUrl += "?";
        for (var key in ajaxParams["AJAX_PARAM_QUERY"]) {
            finalUrl += key + "=" + ajaxParams["AJAX_PARAM_QUERY"][key] + "&";
        }

        // Remove the trailing '&'
        // I like this function "slice" yum yum...
        finalUrl.slice(0, -1);
    }

    // Perform the AJAX request and return
    return $.ajax({
        type: ajaxParams["AJAX_PARAM_METHOD"],
        url: finalUrl,
        headers: ajaxParams["AJAX_PARAM_HEADERS"],
        data: ajaxParams["AJAX_PARAM_BODY"]
    }).always(function () {
        // Disable the processing if it is being shown
        if (isShowProcess) {
            hideProcessing();
        }
    });
}

/**
* Method to get all objects information in the org
* To be used in the beginning of the extension to form the map
* of object key prefix and the API name
* 
* @note Method returns the AJAX object directly for multiple AJAX chaining
* @param        {Instance}        instanceObj    {Object storing information for this SFDC instance}
*/
function getAllObjectInformation(instanceObj) {
    // Form the AJAX request params
    var ajaxParams = {
        AJAX_PARAM_URL: instanceObj.getProp(KEYWORD_INSTANCE_URL) + SF_ENDPOINT_SOBJECTS,
        AJAX_PARAM_METHOD: CALLOUT_TYPE_GET,
        AJAX_PARAM_HEADERS: {
            "Authorization": HEADER_KEYWORD_OAUTH + instanceObj.getProp(KEYWORD_SESSION_ID)
        }
    };

    // Perform the callout and post-processing
    return doAjax(ajaxParams)
        .then(function (data) {
            // Success response
            var response = {};

            if (!data || !data.sobjects) {
                return;
            }

            // Form the object information map for this instance
            for (var key in data.sobjects) {
                var objectInfo = data.sobjects[key];

                response[objectInfo.keyPrefix] = {
                    name: objectInfo.name,
                    isCustomSetting: objectInfo.customSetting,
                    recordUrl: objectInfo.urls.rowTemplate
                };
            }

            return response;
        }, function (error) {
            console.error(error);
            showMessage(MESSAGE_TYPE.ERROR, JSON.stringify(error));
        });
}

/**
* Method to get all the fields data for a specific object
*
* @param        {object}        describeInfo    {All sObjects information}
* @param        {string}        instanceUrl     {URL Salesforce instance}
* @param        {string}        sessionId       {Session ID for the Salesforce instance}
* @param        {string}        recordId        {Record ID for the record}
* @param        {function}      done            {Success callback after getting URL}
* @param        {function}      fail            {Failure callback}
*/
function getObjectData(describeInfo, instanceUrl, sessionId, recordId, done, fail) {
    showProcessing();

    done = done || function () {};
    fail = fail || function () {};

    var objectDescribe = describeInfo[getKeyPrefix(recordId)];

    if (!objectDescribe) {
        fail("Object information not available");
        return;
    }

    if (objectDescribe.isCustomSetting) {
        return getCustomSettingInfo(describeInfo, instanceUrl, sessionId, recordId, done, fail);
    }

    $.ajax({
        type: "GET",
        url: instanceUrl + objectDescribe.recordUrl.replace("{ID}", recordId),
        headers: {
            "Authorization": "OAuth " + sessionId
        }
    })
    .done(function (data) {
        done(data);
    })
    .fail(function(err) {
        fail(err);
    })
    .always(function() {
        hideProcessing();
    });
}

/**
* Method to get the cleaned record information
* Record once passed through this process can be directly taken for insertion
*
* @param        {object}        objectDescribe  {sObject information}
* @param        {object}        recordToInsert  {Record to insert}
* @param        {string}        instanceUrl     {URL Salesforce instance}
* @param        {string}        sessionId       {Session ID for the Salesforce instance}
* @param        {function}      done            {Success callback after getting URL}
* @param        {function}      fail            {Failure callback}
*/
function getCleanRecord(objectDescribe, recordToInsert, instanceUrl, sessionId, done, fail) {
    showProcessing();

    done = done || function () {};
    fail = fail || function () {};

    if (!objectDescribe) {
        fail("Object information not available");
        console.error("Describe: ", objectDescribe, "recordId: ", recordId);
        return;
    }

    // First get the object describe info
    // ... then filter out all the non-writable fields
    // ... then insert the record
    $.ajax({
        type: "GET",
        url: instanceUrl + "/services/data/" + SF_API_VERSION + "/sobjects/" + objectDescribe.name + "/describe",
        headers: {
            "Authorization": "OAuth " + sessionId
        }
    })
    .done(function (data) {
        if (!data.fields || data.fields.length == 0)
            return fail("Unable to get object describe information");
        recordToInsert = cleanupObjectInformation(recordToInsert, data.fields);
        done(recordToInsert);
    })
    .fail(function (err) {
        fail(err);
    })
    .always(function () {
        hideProcessing();
    });
}

/**
* Method to get the cleaned object information
* Clears out all the non-writeable fields
*
* @param        {object}        recordToInsert      {Record to be cleaned}
* @param        {object}        fieldInfo           {Describe field info}
*/
function cleanupObjectInformation(recordToInsert, fieldInfo) {
    for (var fIndex in fieldInfo) {
        var field = fieldInfo[fIndex];
        if (!field.updateable || !field.createable) {
            delete recordToInsert[field.name];
        }
    }
    return recordToInsert;
}

/**
* Method to insert the record in Salesforce using tooling API
* @NOTE This method should not be used to insert custom setting records
*
* @param        {object}        objectDescribe  {Object describe information}
* @param        {object}        recordToInsert  {Record to insert}
* @param        {string}        instanceUrl     {URL Salesforce instance}
* @param        {string}        sessionId       {Session ID for the Salesforce instance}
* @param        {function}      done            {Success callback after getting URL}
* @param        {function}      fail            {Failure callback}
*/
function doInsertCallout(objectDescribe, recordToInsert, instanceUrl, sessionId, done, fail) {
    $.ajax({
        type: "POST",
        url: instanceUrl + "/services/data/" + SF_API_VERSION + "/sobjects/" + objectDescribe.name,
        headers: {
            "Authorization": "OAuth " + sessionId,
            "Content-Type": "application/json; charset=UTF-8",
            "Accept": "application/json"
        },
        data: JSON.stringify(recordToInsert)
    })
    .done(function (data) {
        if (!data.Id)
            return fail(data);
        done(data);
    })
    .fail(function(err) {
        fail(err);
    })
    .always(function() {
        hideProcessing();
    });
}