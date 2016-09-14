/**
* Contains the handlers for all the events for all elements
* Needed to use this approach as inline listeners are not allowed in extensions
*
* @author       Saket Joshi (https://github.com/saket-joshi)
* @version      1.0
*/

"use strict";

/**
* Declaring these variables in a global context so that they can be accessible
* from other files as well
*/
var currentRecord;
var recordToInsert;
var objectApiName;

/**
* Method to select the current record as the source record
* Saves the record in the chrome extension storage space
*/
function selectSourceRecord() {
    // Get the record Id
    var recordId;
    var keyPrefix;
    var selectedRecord;

    try {
        recordId = getCurrentRecordId(currentTabUrl);

        if (!recordId || (recordId.length != 15 && recordId.length != 18))
            throw { message: "Please check whether you are on a valid record detail page" };


        // Get the 3-key prefix for this object
        keyPrefix = getKeyPrefix(recordId);
        // @TODO: Need to find a proper way of getting whether this is a valid record ID
        if (!recordId || !describeInfo[keyPrefix]) {
            showMessage(MESSAGE_TYPE.INFO, "Could not get the record ID from the current page");
            return;
        }
    } catch (exception) {
        showMessage(MESSAGE_TYPE.ERROR, exception.message);
        return;
    }
    
    // Get the record data using the object describe information
    getObjectData(
        describeInfo,
        currentInstanceUrl,
        currentSessionId,
        recordId,
        function (data) {
            currentRecord = data;

            (function() {
                // Clean this record information
                var clonedRecord = getClonedRecord(currentRecord, null, true);
                getCleanRecord(
                    describeInfo[keyPrefix],
                    clonedRecord,
                    currentInstanceUrl,
                    currentSessionId,
                    function (data) {
                        recordToInsert = data;
                        storeRecord(recordToInsert, describeInfo[keyPrefix].name, null, null, null);
                    },
                    function (err) {
                        console.error(err);
                        showMessage(MESSAGE_TYPE.ERROR, err);
                    }
                );
            })();

        },
        function (err) {
            console.error(err);
            showMessage(MESSAGE_TYPE.ERROR, err);
        }
    );
    // Store the record in extension storage for further use
}

function cloneDestination() {
    var recordToInsert;
    var apiName;

    fetchRecord(
        null,
        function(record) {
            recordToInsert = record.RECORD_KEY;
            apiName = record["OBJECT_API_NAME"];

            delete recordToInsert["recordTypeId"];
        },
        null
    )
    .done(function () {
        doInsertCallout(
            {name: apiName},
            recordToInsert,
            currentInstanceUrl,
            currentSessionId,
            function (data) {
                console.log("inserted");
                console.log(data);
            },
            function (err) {
                console.log(err);
            }
        );
    });
    
}