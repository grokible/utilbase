
var ctor = require ('../lib/oop').ctor,
    inherits = require ('inherits');

var _copyChain = function (obj) {
    // There are issues with native error types and serialization (in
    // particular, the 'stack').  For chaining, we just substitute a
    // fake object.  Thus, if we get an Exception, we know the prev
    // chain has a certain structure.

    // There is the possibility we were passed a non-object.  Since
    // we are exception handling, we want to do something sensible
    // and continue.
    if (typeof obj !== 'object') {
        return { message: "" + obj +
            " <= bad object passed to Exception as oPrev arg" };
    }

    var tmp = {};
    if ('message' in obj)
        tmp ['message'] = obj.message;
    else
        tmp ['message'] = "" + obj;

    if ('name' in obj)
        tmp ['name'] = obj.name;

    if ('meta' in obj)
        tmp ['meta'] = obj ['meta'];

    if ('stack' in obj) {
        var stack = obj.stack + "";
        tmp ['stack'] = stack.split ("\n");

        // Sometimes, we get a stack that is not "\n" delimited, and is
        // instead ",    " delimited
        if (tmp ['stack'].length === 1)
            tmp ['stack'] = stack.split (",    ");
    }

    if ('prev' in obj)
        tmp ['prev'] = _copyChain (obj ['prev']);

    return tmp;
}

/**
 * Native Error objects don't work so well:  inheritance doesn't work, the
 * name field is never set right, serialization fails because stack is
 * a gettor.  This class eliminates these issues.  It also adds chaining
 * by replacing any exceptions with a dummy object that has all the
 * fields set.
 */
var Exception = ctor (function (oMessage, oMeta, oPrev, oName) {
    // This special constructor setup (i.e. not calling super) works
    // whereas "normal" idioms tend to fail for subclassing Error.
    // Subclasses of Exception work fine, however.  It's just the builtin
    // Error object that is funky.

    // Inject 'stack' property
    Error.captureStackTrace (this, this.constructor);

    this.name = oName || "Exception";
    this.message = oMessage ? oMessage : "";

    // Make sure oMeta is defined
    if ( ! oMeta)
        oMeta = {};

    // If oMeta is not an object, we wrap and call the thing passed in
    // 'unnamed'.  This is a clue that the call to Exception ctor was
    // done incorrectly, without causing problems (it's safe)

    if (typeof oMeta !== 'object')
        oMeta = { unnamed: oMeta };

    this.meta = oMeta;

    // oPrev is an exception for chaining
    if (oPrev)
        this.prev = _copyChain (oPrev);
});

module.exports = Exception;

inherits (Exception, Error);

Exception.prototype.getMessage = function () {
    return this.message;
}

Exception.prototype.getMeta = function () {
    return this.meta;
}

Exception.prototype.getPrev = function () {
    return this.prev;
}








