'use strict';

var expect = require ('chai').expect;

var RestUtil = require ('./restUtil');

describe ("RestUtil", function () {

    describe ("toQueryParams ()", function () {
        it ("Normal path", function () {
            var s = RestUtil.toQueryParams ({ foo: 'bar', baz: 2 });
            expect (s).to.be.equal ("foo=bar&baz=2");
        });

        it ("Has funny chars", function () {
            var s = RestUtil.toQueryParams ({ foo: 'bar none', baz: 2 });
            expect (s).to.be.equal ("foo=bar%20none&baz=2");
        });

        it ("arrayMode=repeat (default), foo[]=1&foo[]=2&...", function () {
            var s = RestUtil.toQueryParams ({ foo: [1,2,3] });
            expect (s).to.be.equal ("foo%5B%5D=1&foo%5B%5D=2&foo%5B%5D=3");
        });

        // This seems much nicer (is the default some sort of webform std?)
        it ("arrayMode repeat mode (csv), foo=1,2,3", function () {
            var s = RestUtil.toQueryParams ({ foo: [1,2,3] }, 'csv');
            expect (s).to.be.equal ("foo=1%2C2%2C3");
        });

    });

    describe ("uri ()", function () {
        it ("Normal path", function () {
            var s = RestUtil.uri ('/the/path', { foo: 'bar none', baz: 2 });
            expect (s).to.be.equal ("/the/path?foo=bar%20none&baz=2");
        });
    });

});
