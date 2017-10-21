'use strict';

var expect = require ('chai').expect;

var Exception = require ('./exception');

describe ("Exception", function () {

    describe ("ctor", function () {
        it ("Configures expected properties of Exception", function () {

            var e = Exception (`This is an error`,
                { status: 500, dtag: 'gga:server'});
            
            // Has our meta properties
            expect (e.getMeta ()).to.deep.equal
                ({ status: 500, dtag: 'gga:server'});

            // Can be thrown and produces this string
            expect (() => { throw e })
            .to.throw (/This is an error/)

            // Has a stack
            expect (e.stack).to.not.be.empty;

            // Stringifies to class + error message
            expect (e + "").to.match (/^Exception: This is an error$/);

            // Has a name property that matches class name
            expect (e.name).to.match (/^Exception$/);

            //Inheritance
            expect (e).to.be.an.instanceof (Exception);
            expect (e).to.be.an.instanceof (Error);
            expect (e).to.be.an.instanceof (Object);

            /**
             * Thus can be caught:
             *
             * } catch (e) {
             *     if (e instanceof Exception)
             */
        });

        it ("Exception () - init members, line 1 stringify ok",
            function () {

            var e = Exception ();
            expect (e.getMessage ()).to.equal ("");
            expect (e.getMeta ()).to.deep.equal ({});
            expect (e + "").to.match (/^Exception$/);
        });

        it ("Exception (message) - init members, line 1 stringify ok",
            function () {

            var e = Exception ("message");
            expect (e.getMessage ()).to.equal ("message");
            expect (e.getMeta ()).to.deep.equal ({});
            expect (e + "").to.match (/^Exception: message$/);
        });

        it ("Exception (message, meta) - init members, line 1 stringify ok",
            function () {

            var e = Exception ("message", { foo: 'bar' });
            expect (e.getMessage ()).to.equal ("message", { foo: 'bar' });
            expect (e.getMeta ()).to.deep.equal ({ foo: "bar" });
            expect (e + "").to.match (/^Exception: message$/);
        });


        // Accidental passing of string where meta goes
        it ("Protects when 2nd arg is not object: Exception (message, str)",
        function () {
            var e = Exception ("message", "my str");
            expect (e.getMessage ()).to.equal ("message");
            expect (e.getMeta ()).to.deep.equal ({ unnamed: "my str" });
            expect (e + "").to.match (/^Exception: message$/);
        });

        // Accidental passing of string where meta goes
        it ("Allows setting name property",
        function () {
            var e = Exception ("message", undefined, undefined, "Name");
            expect (e.getMessage ()).to.equal ("message");
            expect (e.getMeta ()).to.deep.equal ({});
            expect (e.name).to.equal ("Name");
            expect (e + "").to.match (/^Name: message$/);
        });

    });

});
