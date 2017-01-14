/**
* Master file that contains all the globally accessible properties
*
* @author       Saket Joshi (https://github.com/saket-joshi)
* @version      1.0
*/

"use strict";

//var j$ = $.noConflict();

var KEYWORD_INSTANCE_URL = "INSTANCE_URL";
var KEYWORD_SESSION_ID = "SESSION_ID";
var KEYWORD_OBJECTS_MAP = "OBJECTS_MAP";

var SF_API_VERSION = "v35.0";
var SF_ENDPOINT_SERVICES = "/services/data/";
var SF_ENDPOINT_SOBJECTS = SF_ENDPOINT_SERVICES + SF_API_VERSION + "/sobjects";

var CALLOUT_TYPE_GET = "GET";
var CALLOUT_TYPE_POST = "POST";
var CALLOUT_TYPE_DELETE = "DELETE";

var HEADER_NAME_AUTHORIZATION = "Authorization";
var HEADER_KEYWORD_OAUTH = "OAuth ";

/**
* Globally accessible object that stores private properties
*
* @help     Usage
*   var objectName = new Instance();
*   objectName.setProp(PROPERTY_NAME, VALUE);
*   objectName.getProp(PROPERTY_NAME);
*/
var Instance = (function () {
    function Instance(key, value) {
        this.setProp = function (key, value) {
            this.params = this.params || {};
            this.params[key] = value;
        },
        this.getProp = function (key) {
            return this.params[key];
        };
    }

    return Instance;
}());

/**
* Message types wrapper
*/
var MESSAGE_TYPE = {
    SUCCESS: "alert-success",
    INFO: "alert-info",
    WARNING: "alert-warning",
    ERROR: "alert-danger"
};