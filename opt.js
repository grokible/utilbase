
var ctor = require ('./oop').ctor,
    inherits = require ('inherits'),
    Prop = require ('./prop');

/**
 * Checks and copies the properties passed in opt against an allowed
 * properties dict (validProps).  Properties in validProps with values
 * different than "undefined" are treated as defaults.  Thus the property
 * is "allowed" and "defaulted" (property with a value may be specified
 * and if not will be provided with the default value).  If a property
 * is specified in validProps with a value "undefined" then this is
 * an "allowed" property, without a default.  This means that the property
 * may be specified in the passed options, and if omitted, will have no
 * value (optional property, no default).  This property can be "turned
 * into a required property" by calling required () on it (this just
 * checks that the property exists and has a value, otherwise it throws).
 * Putting this all together:
 *
 *     var validOpt = {
 *         min: 0,             // defaulted
 *         max: undefined,     // allowed (not defaulted)
 *         start: undefined,   // (we will make this required, see below)
 *     };
 *
 *     var MyConstructor = function (opt) {
 *         this.options = Opt (validOpt, opt);
 *         this.options.required ('start');  // throws if not present
 *    
 *         // ...
 *     }
 * 
 *
 * validProps is a dict with default values, or undefined.
 */

var Opt = ctor (function Opt (validProps, opt, filterExtra) {
    opt = opt || {};

    // filterExtra allows extra keys to be passed without causing an
    // exception.  If a single opt must be split up to use, this can
    // be used to apply only the keys at this level.  To then take
    // the remaining keys and pass down can be done by using TODO

    // Find all illegal keys (not in validPropNames), and copy key/values
    // passed in opt to this.options

    this.options = {};

    this.illegal = {};
    var keys = Object.keys (opt);
    keys.forEach (k => {
        var vIn = opt [k];
        if ( ! (k in validProps))
            this.illegal [k] = vIn;
        else
            this.options [k] = vIn;
    });

    // For all keys that are not present or have a value of undefined,
    // copy any values in validProps that are not undefined.
    // Thus an "undefined" in validProps is how to do a non-defaulted
    // required property (coupled with a post-check).

    var vKeys = Object.keys (validProps);
    vKeys.forEach (k => {

        // If the key in validProps is not defined in this.options,
        // copy any default value.

        if ( ! (k in this.options)) {
            var vDefault = validProps [k];
            if (vDefault === undefined)  // undefined is not a 'real' value
                return;

            this.options [k] = vDefault;
        }
    });

    // If extra keys are allowed, do not copy the values and we do not throw
    // an exception for extra keys.
    if (filterExtra)
        return;

    var keys = Object.keys (this.illegal);

    if (keys.length)
        throw Error (`Opt: Illegal option(s): ${ keys.join (", ") }`);
});

inherits (Opt, Object);

Opt.prototype.get = function (path, isRequired) {
    var x = Prop.get (this.options, path);

    if (isRequired && x === undefined) {
        var msg = `Opt: Required option '${ path }' not found in ` +
            `passed options`;
        throw Error (msg);
    }

    return x;
}

Opt.prototype.check = function (k, testExpr, testDesc, noThrow) {
    if (testExpr)
        return true;

    var msg = `Opt: option '${ k }' failed validation test`

    if (testDesc)
        msg += `: ${ testDesc }`;

    if (noThrow)
        return false;

    throw Error (msg);
}

Opt.prototype.exists = function (k) {
    return k in this.options;
}

Opt.prototype.getIllegal = function () {
    // Make a copy
    return Object.assign ({}, this.illegal);
}

module.exports = Opt;
