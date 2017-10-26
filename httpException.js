
var ctor = require ('./oop').ctor,
    inherits = require ('inherits');

var Exception = require ('./exception');

var HttpException = ctor (function (status, msg, dtag, symbol, oPrev) {
    var meta = { status: status };

    if (dtag)
        meta ['dtag'] = dtag;

    // Symbol, if provided, is part of the exposed API.  dtag should not
    // be relied on, as it can change.

    if (symbol)
        meta ['symbol'] = symbol;

    this.constructor.super_.call (this, msg, meta, oPrev, "HttpException")
});

inherits (HttpException, Exception);

module.exports = HttpException;

HttpException.prototype.getStatus = function () {
    return this.meta.status;
}

HttpException.prototype.getSymbol = function () {
    return 'symbol' in this.meta ? this.meta ['symbol'] : undefined;
}

HttpException.prototype.getDtag = function () {
    return 'dtag' in this.meta ? this.meta ['dtag'] : undefined;
}

// static methods for constructing known errors
HttpException.E = function (httpStatus, msg, oExtraMsg, oDtag, oPrev) {
    var symbol = `http.${ httpStatus }`;
    msg = oExtraMsg ? `${ msg }: ${ oExtraMsg }` : msg;
    
    var e = HttpException (httpStatus, msg, oDtag, symbol, oPrev);
    return e;
}

HttpException.E401 = function (oMessage, oDtag, oPrev) {
    return HttpException.E (401, "Unauthorized", oMessage, oDtag, oPrev);
}

HttpException.E403 = function (oMessage, oDtag, oPrev) {
    return HttpException.E (403, "Forbidden", oMessage, oDtag, oPrev);
}










