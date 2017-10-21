'use strict';

var expect = require ('chai').expect;

var HttpException = require ('./httpException');

describe ("HttpException", function () {

    describe ("ctor", function () {
        it ("Checks all properties of HttpException", function () {

            var exc = HttpException (500, `This is an error`,
                'gga:server', 'my-symbol');

            // Has our meta properties
            expect (exc.getMeta ()).to.deep.equal
                ({ status: 500, dtag: 'gga:server', symbol: 'my-symbol' });

            // Individual gettors
            expect (exc.getStatus ()).to.equal (500);
            expect (exc.getDtag ()).to.equal ('gga:server');
            expect (exc.getSymbol ()).to.equal ('my-symbol');

            // Can be thrown and produces this string
            expect (() => { throw exc })
                .to.throw (/.*This is an error/)

            // Has a stack
            expect (exc.stack).to.not.be.empty;

            // Stringifies to class + error message
            expect (exc + "").to.match (/^HttpException: This is an error$/);


            // Has a name property that matches class name
            expect (exc.name).to.match (/^HttpException$/);

            //Inheritance
            expect (exc).to.be.an.instanceof (HttpException);
            expect (exc).to.be.an.instanceof (Error);
            expect (exc).to.be.an.instanceof (Object);

            /**
             * Thus can be caught:
             *
             * } catch (e) {
             *     if (e instanceof HttpException)
             */
        });

        it ("Optional dtag", function () {

            var e = HttpException (500, `This is an error`,
                'gga:server');

            // Has our meta properties
            expect (e.getMeta ()).to.deep.equal
                ({ status: 500, dtag: 'gga:server' });

            // Individual gettors
            expect (e.getStatus ()).to.equal (500);
            expect (e.getDtag ()).to.equal ('gga:server');
            expect (e.getSymbol ()).to.be.undefined;
        });

        it ("Optional symbol", function () {

            var e = HttpException (400, `This is an error`,
                undefined, 'my-symbol');

            // Has our meta properties
            expect (e.getMeta ()).to.deep.equal
                ({ status: 400, symbol: 'my-symbol' });

            // Individual gettors
            expect (e.getStatus ()).to.equal (400);
            expect (e.getDtag ()).to.be.undefined;
            expect (e.getSymbol ()).to.be.equal ('my-symbol');
        });

    });

    describe ("HttpException.E ()", function () {
        it ("Creates a properly configured HttpException", function () {
            var e = HttpException.E (401, "Unauthorized", "My msg",
                "exc:http:401");
            expect (e.getMessage ()).to.equal ("Unauthorized: My msg");
            expect (e.getStatus ()).to.equal (401);
            expect (e.getDtag ()).to.be.equal ("exc:http:401");
            expect (e.getSymbol ()).to.be.equal ("http.401");
        });
    });

    describe ("HttpException.E401 ()", function () {
        it ("Creates a properly configured 401 (Unauthorized)", function () {
            var e = HttpException.E401 ("My msg", "exc:http:401");
            expect (e.getStatus ()).to.equal (401);
            expect (e.getDtag ()).to.be.equal ("exc:http:401");
            expect (e.getSymbol ()).to.be.equal ("http.401");
        });
    });

});
