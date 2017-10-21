
var RestUtil = {};
module.exports = RestUtil;

RestUtil.uri = function (path, optQueryParams, optArrayMode) {
    var uri = `${ path }`;
    if (optQueryParams) {
        var s = RestUtil.toQueryParams (optQueryParams, optArrayMode);
        uri += `?${ s }`;
    }
    
    return uri;
}

/**
 * opt { 'protocol': ..., 'port': ... }
 * optArrayMode == 'repeat' or 'csv' (repeat by default)
 */
RestUtil.url = function (host, path, opt, optArrayMode) {
    var optQueryParams;
    if (opt && 'query' in opt)
        optQueryParams = opt ['query'];

    var uri = this.uri (path, optQueryParams, optArrayMode);
    var protocol = 'protocol' in opt ? opt ['protocol'] : 'https';
    var port = 'port' in opt ? opt ['port'] : "";
    var url = `${ opt ['protocol'] }://${ host }`;

    if (port)
        url += `:${ port }`;
    
    url += uri;
    
    return url;
}

RestUtil.basicAuth = function (user, pw) {
    var val = "Basic " + new Buffer 
        (`${ user }:${ pw }`).toString ('base64');
    return val;
}

RestUtil.toQueryParams = function (obj, arrayMode) {
    // only supported modes are repeat, or csv
    if ( ! arrayMode)
        arrayMode = 'repeat';

    var str = [];
    for (var p in obj) {
        if (obj.hasOwnProperty (p)) {
            var v = obj [p];
            // This will not handle objects
            if (Array.isArray (v)) {
                if (arrayMode == 'repeat') {
                    for (var i = 0 ; i < v.length ; i++) {
                        var k = p + "[]";
                        var el = v [i];
                        str.push (encodeURIComponent (k) + "="
                            + encodeURIComponent (el));
                    }
                } else {
                    // Assume csv
                    var v2 = v.join (",");
                    str.push (encodeURIComponent (p) + "="
                        + encodeURIComponent (v2));
                }
            }
            else {
                str.push (encodeURIComponent (p) + "="
                    + encodeURIComponent (v));
            }
        }
    }

    return str.join ("&");
}




