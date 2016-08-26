/**
* JS wrapper for performing RESTful callouts to Salesforce
*
* @author       Saket Joshi (https://github.com/saket-joshi)
* @version      1.1
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

        console.log(response);
        done(response);
    })
    .fail(function (err) {
        fail(err);
    })
    .always(function () {
        hideProcessing();
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
var getObjectData = function (describeInfo, instanceUrl, sessionId, recordId, done, fail) {
    showProcessing();

    done = done || function () {};
    fail = fail || function () {};

    var objectDescribe = describeInfo[getKeyPrefix(recordId)];

    if (!objectDescribe) {
        fail("Object information not available");
        console.error("Describe: ", objectDescribe, "recordId: ", recordId);
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
* Method for inserting the object in SF
* @NOTE This method should not be used to insert custom setting records
*
* @param        {object}        describeInfo    {All sObjects information}
* @param        {object}        recordToInsert  {Record to insert}
* @param        {string}        instanceUrl     {URL Salesforce instance}
* @param        {string}        sessionId       {Session ID for the Salesforce instance}
* @param        {function}      done            {Success callback after getting URL}
* @param        {function}      fail            {Failure callback}
*/
var insertObjectRecord = function (describeInfo, recordToInsert, instanceUrl, sessionId, done, fail) {
    showProcessing();

    done = done || function () {};
    fail = fail || function () {};

    var objectDescribe = describeInfo[getKeyPrefix(recordId)];

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
        return doInsertCallout(objectDescribe, recordToInsert, instanceUrl, sessionId, done, fail);
    })
    .fail(function (err) {
        fail(err);
    })
    .always(function () {
        hideProcessing()
    });
}

/**
* Method to get the cleaned object information
* Clears out all the non-writeable fields
*
* @param        {object}        recordToInsert      {Record to be cleaned}
* @param        {object}        fieldInfo           {Describe field info}
*/
var cleanupObjectInformation = function (recordToInsert, fieldInfo) {
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
var doInsertCallout = function (objectDescribe, recordToInsert, instanceUrl, sessionId, done, fail) {
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