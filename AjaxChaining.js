var SfdcTools = (function () {
    function SfdcTools(key, value) {
        this.setProp = function (key, value) {
            this.params = this.params || {};
            this.params[key] = value;
        },
        this.getProp = function (key) {
            return this.params[key];
        };
    }

    return SfdcTools;
}());

function getAllObjectInformation(instanceObj, success, failure) {
    success = success || function() {};
    failure = failure || function() {};

    return $.ajax({
        type: "GET",
        url: instanceObj.getProp["instanceUrl"],
        headers: {
            "Authorization": "OAuth " + instanceObj.getProp["sessionId"]
        }
    });
}

function printResult(result) {
    console.log(result);
}

var thisInstance = new SfdcTools();
thisInstance.setProp("instanceUrl", "https://httpbin.org/get");

var thatInstance = new SfdcTools();
thatInstance.setProp("instanceUrl", "https://httpbin.org/get?param=2");

getAllObjectInformation(thisInstance).then(printResult, function (err) { console.error(err) } );