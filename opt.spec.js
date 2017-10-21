'use strict';

var Opt = require ('./opt.js');

var Oop = require ('./oop.js');
var ctor = Oop.ctor;

var expect = require ('chai').expect;

describe ("Opt", function () {

    describe ("Opt ctor", function () {
        var validOpt = {
            min: 0,             // defaulted
            max: undefined,     // allowed (not defaulted)
            start: undefined,   // (we will make this required, see below)
        };
    
        var MyCtor = ctor (function (opt) {
            var options = this.options = Opt (validOpt, opt);

            var min = options.get ('min');
            var max = options.get ('max');
            var start = options.get ('start', true);

            options.check ('start', start >= min,
                `start (${ start }) >= min (${ min })`);

            options.check ('start', start <= max,
                `start (${ start }) <= max (${ max })`);
        });
    
        it ("Check parameters - normal path", function () {
            var obj = MyCtor ({ max: 10, start: 2 });
            expect (obj.options.get ('min')).to.equal (0);
            expect (obj.options.get ('max')).to.equal (10);
            expect (obj.options.get ('start')).to.equal (2);
        });

        it ("Check parameters - fail on required", function () {
            expect (() => MyCtor ({}))
                .to.throw (/Opt: Required option \'start\' not found/)

            expect (() => MyCtor ({ start: 5, min: 6 }))
            .to.throw
            (/.*\'start\' failed validation test: start .5. >= min .6./)

            expect (() => MyCtor ({ start: 8, max: 6 }))
            .to.throw
            (/.*\'start\' failed validation test: start .8. <= max .6./)

        });
    });


    describe ("Opt two-level strategy", function () {
        /**
         * This shows a multi-level strategy for passing a single opt in
         * and then splitting it up easily to make sure each level gets
         * what it needs, as well as checks what it should.
         */
        var validOpt = {
            min: 0,             // defaulted
            max: undefined,     // allowed (not defaulted)
            start: undefined,   // (we will make this required, see below)
        };

        var validOptUpper = {
            foobar: undefined,  // required - for upper level
        };

    
        var MyCtor = ctor (function (opt) {
            var options = this.options = Opt (validOpt, opt);

            this.min = options.get ('min');
            this.max = options.get ('max');
            this.start = options.get ('start', true);
        });

        var MyCtorUpper = ctor (function (opt) {
            // 3rd arg = true => filterExtra
            var options = this.options = Opt (validOptUpper, opt, true);
            var optForLower = options.getIllegal ();

            this.foobar = options.get ('foobar', true);
            this.lower = MyCtor (optForLower);
        });

        it ("Check parameters - normal path - upper + lower", function () {
            var obj = MyCtorUpper ({ max: 10, start: 2, foobar: 'bar' });
            expect (obj.foobar).to.equal ('bar');

            var lower = obj.lower;
            expect (lower.min).to.equal (0);
            expect (lower.max).to.equal (10);
            expect (lower.start).to.equal (2);
        });

        it ("Check parameters - various failure cases",
            function () {

            // fail - omit lower required 'start'
            expect (() => MyCtorUpper ({ max: 10, foobar: 'bar' }))
                .to.throw (/Opt: Required option \'start\' not found/)

            // fail - omit higher required 'foobar'
            expect (() => MyCtorUpper ({ max: 10, start: 2 }))
                .to.throw (/Opt: Required option \'foobar\' not found/)
        });

        it ("Get path",
            function () {

            var validOpt = { p: undefined };
            var opt = { p: { x : 'a' }};
            var options = Opt (validOpt, opt);
            var px = options.get ("p.x", true);
        });

    });

});
