'use strict';

var Oop = require ('./oop.js');
var ctor = Oop.ctor;
// var inherits = Oop.inherits;
var inherits = require ('inherits');

var expect = require ('chai').expect;

describe ("Oop", function () {

    describe ("ctor (Point)", function () {
        it ("Create a valid constructor for a Point", function () {

            var Point = ctor (function (x, y) {
                this.x = x;
                this.y = y;
            });

            // Without "new"
            var pt = Point (20, 30);

            expect (pt.x).to.equal (20);
            expect (pt.y).to.equal (30);

            expect (pt.constructor).to.equal(Point);

            // With "new"
            pt = new Point (20, 30);

            expect (pt.x).to.equal (20);
            expect (pt.y).to.equal (30);

            expect (pt.constructor).to.equal(Point);
        });

    });

    describe ("inherits (not an Oop function! DEMO)", function () {
        it ("Create a subclassed constructor", function () {

            var Point2d = ctor (function (x, y) {
                this.x = x;
                this.y = y;
            });

            inherits (Point2d, Object);

            Point2d.prototype.func1 = function () {
                return "func1";
            }

            var Point3d = ctor (function (x, y, z) {
                // HOWTO - call base constructor (super)
                this.constructor.super_.call (this, x, y);
                this.z = z;
            });

            inherits (Point3d, Point2d);

            // HOWTO:  Override base class
            Point3d.prototype.func1 = function ANAME () {
                return "Point3d's func1";
            }

            Point3d.prototype.func2 = function () {
                return "func2";
            }

            var pt1 = Point2d (20, 30);
            var pt2 = Point3d (20, 30, 40);

            // Normal properties base class 
            expect (pt1).to.have.property ('x').to.equal (20);
            expect (pt1).to.have.property ('y').to.equal (30);

            // Properties in derived class.  Verify that 
            // base constructor was called.
            expect (pt2).to.have.property ('x').to.equal (20);
            expect (pt2).to.have.property ('y').to.equal (30);
            expect (pt2).to.have.property ('z').to.equal (40);

            // instanceof test
            expect (pt2 instanceof Point3d).to.be.true;
            expect (pt2 instanceof Point2d).to.be.true;

            // verify functions as expected
            expect (pt1.func1 ()).to.equal ("func1");

            // Override
            expect (pt2.func1 ()).to.equal ("Point3d's func1");

            expect (() => pt1.func2 ())
                .to.throw (/pt1.func2 is not a function/);


            // This doesn't work (it's "wrapperCtor");
            expect (Point3d.name).to.equal ("wrapperCtor");

            // Test of new
            var pt3 = new Point3d (200, 300, 400);
            expect (pt3 instanceof Point3d).to.be.true;
        });

    });



});
