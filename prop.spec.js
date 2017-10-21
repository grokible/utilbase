'use strict';

var expect = require ('chai').expect;

var Prop = require ('./prop');

describe ("Prop", function () {

    describe ("get (obj, path, oDefault)", function () {
        it ("+/- base cases", function () {
            var obj = {
                a: 'b',
                b: { c: 'd' },
            };

            expect (Prop.get (obj, 'a')).to.be.equal ('b');
            expect (Prop.get (obj, 'b.c')).to.be.equal ('d');
            expect (Prop.get (obj, 'f')).to.be.undefined;
            expect (Prop.get (obj, 'b.a')).to.be.undefined;
        });
    });

    describe ("required (obj, path)", function () {
        it ("+/- base cases", function () {
            var obj = {
                a: 'b',
                b: { c: 'd' },
            };

            expect (Prop.required (obj, 'a')).to.be.equal ('b');
            expect (Prop.required (obj, 'b.c')).to.be.equal ('d');

            expect (() => { Prop.required (obj, 'f') })
                .to.throw (/Required property 'f' not found in obj/);

            expect (() => { Prop.required (obj, 'b.a') })
                .to.throw (/Required property 'b.a' not found in obj/);
        });
    });


    describe ("check (path, test, testDesc)", function () {
        it ("+/- base cases", function () {
            var a = 'b';

            Prop.check ('b', a == 'b', "a == 'b'");

            expect (() => { Prop.check ('b', a == 'c', "a == 'c'") })
                .to.throw (/Property 'b' failed validity check: a == 'c'/);
        });
    });

});
