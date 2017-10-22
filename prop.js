var Prop = {};
module.exports = Prop;

/**
 * Will safely allow you to get a property using path notation.  If
 * the property does not exist (at some point on the path, the property
 * is not defined), then the default will be returned (undefined).
 */
Prop.get = function (obj, path, oDefault) {
    var def = oDefault === undefined ? undefined : oDefault;
    var arr = path.split (".");
    var cur = obj;
    for (var i = 0 ; i < arr.length ; i++) {
        if ( ! cur || typeof cur != 'object')
            return def;

        var key = arr [i];
        if (key in cur)
            cur = cur [key];
        else
            return def;
    }

    return cur;
}

Prop.required = function (obj, path) {
    var v = Prop.get (obj, path);
    if (v === undefined)
        throw Error (`Required property '${ path }' not found in obj`);
    return v;
}

Prop.check = function (path, test, testDesc) {
    if ( ! test)
        throw Error (`Property '${ path }' failed validity check: ` +
            `${ testDesc }`);
}

Prop.toQueryParams = function (obj, oArrayMode) {
    // only supported modes are repeat, or csv
    if ( ! oArrayMode)
        oArrayMode = 'repeat';
    

    var str = [];
    for (var p in obj) {
        if (obj.hasOwnProperty (p)) {
            var v = obj [p];
            // This will not handle objects
            if (Array.isArray (v)) {
                if (oArrayMode == 'repeat') {
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

Prop.mapToObject = function (map) {
    var obj = {};
    map.forEach ((v, k) => obj [k] = v);
    return obj;
}




