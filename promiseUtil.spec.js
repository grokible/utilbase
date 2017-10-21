'use strict';

var PromiseUtil = require ('./promiseUtil.js');

var chai = require ('chai');
chai.use (require ('chai-as-promised'));
var expect = chai.expect;
var assert = chai.assert;

PromiseUtil.hookUnhandledPromiseRejection (function (reason) {
    console.log (`Unhandled Promise Rejection: `, reason);
});

describe ("PromiseUtil", function () {

    describe ("forEach", function () {
        it ("All items processed, expected array returned", function () {
            var arr = ['a', 'b', 'c'];
            var pr = PromiseUtil.forEach (arr, (item) => {
                // This is the "asyncItemFn" and must return a promise
                // We will take the item (a string) and append "x" to it
                return Promise.resolve (item + "x");
            })
            .then (resultArr => {
                return resultArr;
            });

            expect (pr).to.eventually.eql (['ax', 'bx', 'cx']);
        });
        
        it ("Exception (defaults => fail at first exc)", function () {
            var arr = ['a', 'b', 'c'];

            // N.B. Easiest to wrap in a function because we need
            // to invoke the function and catch.

            var pr = PromiseUtil.forEach (arr, (item, idx) => {
                if (idx == 1)
                    throw Error ("Fake");

                return Promise.resolve (item + "x");                            
            })
            .then (resultArr => {
                assert (false, 'should not reach this line');
                return resultArr;
            })
            .catch (e => {
                // We catch and return to examine the returned exception
                expect (e).to.have.property ('result').to.eql (['ax']);
                expect (e).to.have.property ('index', 1);
                expect (e).to.have.property ('item', 'b');
                expect (e).to.have.property ('error');
            });
        });

        it ("Exception (all=true, throws=true [default])", function () {
            var arr = ['a', 'b', 'c'];

            // N.B. Easiest to wrap in a function because we need
            // to invoke the function and catch.

            var pr = PromiseUtil.forEach (arr, (item, idx) => {
                if (idx == 1)
                    throw Error ("Fake");

                return Promise.resolve (item + "x");                            
            }, { all: true })
            .then (resultArr => {
                assert (false, 'should not reach this line');
                return resultArr;
            })
            .catch (e => {
                // We catch and return to examine the returned exception
                expect (e).to.have.property ('result').to.include.members
                    (['ax', 'cx']);
                expect (e).to.have.property ('result').to.have.length (3);
                expect (e).to.have.property ('errorCount', 1);
                expect (e).to.have.property ('error');
            });
        });


    });

});
