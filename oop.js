// oop.js

var Oop = {};
module.exports = Oop;

/**
 * Creates a "safe" constructor (one which doesn't need the "new" keyword)
 *
 *   var ctor = require ('oop').ctor;
 *   var Point = ctor (function (x, y) {
 *       this.x = x;
 *       this.y = y;
 *   });
 *
 *   var pt = Point (20, 30);
 *
 */

Oop.ctor = function Oop_ctor (realCtor) {
    // This is going to be the actual constructor
    return function wrapperCtor () {
        var obj; // object that will be created

        if (this instanceof wrapperCtor) {
            // Called with new
            obj = this;
        } else {
            // Called without new. Create an empty object of the
            // correct type without running that constructor
            surrogateCtor.prototype = wrapperCtor.prototype;
            obj = new surrogateCtor ();
        }    
        // Call the real constructor function
        realCtor.apply (obj, arguments);
        return obj;
    }
}

function surrogateCtor () {} // Do nothing function, used for above impl.


