/**
* JS class that contains all the utility methods
* 
* @author       Saket Joshi (https://github.com/saket-joshi)
* @version      1.0
*/

"use strict";

/**
* Method to show the processing loader
*/
var showProcessing = function () {
    $("#loader").show();
}

/**
* Method to hide the processing loader
*/
var hideProcessing = function () {
    $("#loader").hide();
}

/**
* Method to get the 3-key prefix for the objects
*
* @param        {string}        recordId    {Record ID from which the prefix is to be calculated}
*/
var getKeyPrefix = function (recordId) {
    if (!recordId)
        return;

    return recordId.substring(0,3);
}

/**
* Method to clone an existing record into a JavaScript object
* @NOTE This method does NOT insert the record in the destination SF org
* @NOTE Either one of the optional parameters is required
*
* @param        {object}        recordToClone       {Record object that is to be cloned}
* @param        {array}         fieldsToClone       {Optional; Array of field API names to be cloned}
* @param        {boolean}       cloneAllFields      {Optional; Boolean to specify whether to clone all the fields}
*/
var getClonedRecord = function (recordToClone, fieldsToClone, cloneAllFields) {
    if (fieldsToClone == null && cloneAllFields == null)
        return;

    var returnObj = {};
    
    if (cloneAllFields) {
        returnObj = $.extend(true, {}, recordToClone);
    } else {
        $.each(fieldsToClone, function(arrIndex, field) {
            if (recordToClone[field]) {
                returnObj[field] = recordToClone[field];
            }
        });
    }

    // Cleaning up...
    delete returnObj["Id"];
    delete returnObj["attributes"];

    return returnObj;
}