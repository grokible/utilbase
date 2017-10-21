
var inherits = require ('inherits'),
    Debug = require ('debug');

var ctor = require ('./oop').ctor,
    Opt = require ('./opt');

var RestUtil = require ('./restUtil'),
    rp = require ('request-promise');

var validOpt = {
    host: 'localhost',  // defaulted
    port: 443,          // defaulted
    protocol: 'https',  // defaulted
    headers: undefined,
};

var RestCaller = ctor (function RestCaller (prefix, opt) {
    var options = Opt (validOpt, opt);

    this.host = options.get ('host');
    this.port = options.get ('port');
    this.protocol = options.get ('protocol');
    this.headers = options.get ('headers') || {};

    this.prefix = prefix;
    return this;
});

module.exports = RestCaller;

RestCaller.prototype = Object.create (Object.prototype);

RestCaller.prototype.url = function (path, optQuery) {
    var wholePath = this.prefix + path;
    var opt = {
        protocol: this.protocol,
        port: this.port,
    };

    if (optQuery)
        opt ['query'] = optQuery;

    var url = RestUtil.url (this.host, wholePath, opt);
    
    return url;
}

RestCaller.prototype.makeOpt = function (method, path, optQuery) {
    var rpOpt = {
        method: method,
        uri: this.url (path, optQuery),
        json: true,
        headers: this.headers,
        rejectUnauthorized: false,   // TODO - pass this in
    };

    return rpOpt;
}

RestCaller.prototype.get = function (path, optQuery) {
    var rpOpt = this.makeOpt ('GET', path, optQuery);
    return rp (rpOpt);
}

RestCaller.prototype.post = function (path, postBody, optQuery) {
    var rpOpt = this.makeOpt ('POST', path, optQuery);
    rpOpt ['body'] = postBody;
    return rp (rpOpt);
}

RestCaller.prototype.postForm = function (path, postBody, optQuery) {
    var rpOpt = this.makeOpt ('POST', path, optQuery);
    rpOpt ['form'] = postBody;
    return rp (rpOpt);
}

RestCaller.prototype.patch = function (path, patchBody, optQuery) {
    var rpOpt = this.makeOpt ('PATCH', path, optQuery);
    rpOpt ['body'] = patchBody;
    return rp (rpOpt);
}

RestCaller.prototype.delete = function (path, deleteBody, optQuery) {
    var rpOpt = this.makeOpt ('DELETE', path, optQuery);
    rpOpt ['body'] = deleteBody;
    return rp (rpOpt);
}
