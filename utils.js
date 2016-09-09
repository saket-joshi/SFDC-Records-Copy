/**
* JS class that contains all the utility methods
* 
* @author       Saket Joshi (https://github.com/saket-joshi)
* @version      1.0
*/

"use strict";

/**
* Message types wrapper
*/
var MESSAGE_TYPE = {
    SUCCESS: "alert-success",
    INFO: "alert-info",
    WARNING: "alert-warning",
    ERROR: "alert-danger"
};

/**
* Method to show the processing loader
*/
function showProcessing() {
    $("#loader").show();
}

/**
* Method to hide the processing loader
*/
function hideProcessing() {
    $("#loader").hide();
}

/**
* Method to get the 3-key prefix for the objects
*
* @param        {string}        recordId    {Record ID from which the prefix is to be calculated}
*/
function getKeyPrefix(recordId) {
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
function getClonedRecord(recordToClone, fieldsToClone, cloneAllFields) {
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

/**
* Method to show the alert on the page
* @param        {string}        type 
* @param        {object}        message
*/
function showMessage(type, message) {
    $("#message-panel").find(".alert").text(message).show().addClass(type);
}

/**
* Message to hide the alert box
*/
function hideMessage() {
    $("#message-panel").find(".alert").text("").hide();
}

/**
* Method to show a particular element
* @param        {string}        selector
*/
function showElement(selector) {
    return $(selector).show();
}

/**
* Method to hide a particular element
* @param        {string}        selector
*/
function hideElement(selector) {
    return $(selector).hide();
}