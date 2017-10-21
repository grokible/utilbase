
var Opt = require ('./opt');

// A static util lib starter
var PromiseUtil = {};
module.exports = PromiseUtil;

/**
 * Makes a new promise and returns an object with 'promise', 'resolve'
 * and 'reject'.  Useful for externalizing the resolve and reject functions
 * to be used for completion somewhere other than the promise.
 * For example here is a function that saves the resolve function in
 * 'this.finishResolve' which can be used later to signal finished.
 *
 *     ChildProcess.prototype.finish = function () {
 *         var h = PromiseUtil.makeTriggers ();
 *         this.finishResolve = h ['resolve'];
 *         return h ['promise'];
 *     }
 *
 *     var pr = child.finish ()
 *     .then (code => {
 *         console.log (`exited with code = ${ code }`);
 *     });
 *
 *     // ... somewhere else
 *     this.finishResolve (exitCode);  // will trigger end
 */
PromiseUtil.makeTriggers = function () {
    var h = {};
    h ['promise'] = new Promise ((resolve, reject) => {
        h ['resolve'] = resolve;
        h ['reject'] = reject;
    });

    return h;
}

/**
 * Safely wraps an asyncFn that may not return promises for value or catch
 */
PromiseUtil.makeAsync = function (asyncOrNotFn, optThis) {
    var _this = optThis || null;
    var fn = function () {
        var args = arguments;
        var pr = new Promise ((resolve, reject) => {
            try {
                var x = asyncOrNotFn.apply (_this, args);
                resolve (x);
            } catch (e) {
                reject (e);
            }
        });

        return pr;
    }
    return fn;
}

/**
 * Process an async function for members of an array and return the
 * resulting array of results.  The item "doit" function "asyncOrNotItemFn"
 * is wrapped to make it safe (e.g. it can throw exceptions or not return
 * promises and still be OK).
 * 
 * Exceptions may be processed in different ways, based on the options
 * passed in which control this behavior:
 *
 *     all=false (default), throws=true (default)
 *         Throws on first encountered exception terminating the loop.
 *         Exception is wrapped in an object with other metadata for
 *         processing (below).  Result array in object will only have
 *         successfully processed items (and be that length).
 *
 *             { error: <exception>, item: <item>, index: <index of item>
 *               result: <processed array until error> }
 *     
 *     all=true, throws=true (default)
 *         Process all items.  If an exception is thrown, this is caught
 *         and stored in the array in lieu of the result item.  The
 *         exception is wrapped in a simple object for easy identification:
 *
 *              { result: <fully processed array>,
 *                errorCount: <count of errors>, error: <msg> }
 *
 *         The object is much simpler than the previous option as you
 *         will be returned the result array, and all other aspects
 *         may be discerned (i.e. item in original array, index in
 *         result array).
 *     
 *     If throws is set to false (non default), then you will be returned
 *     the result array, and will need to iterate over it to determine
 *     whether there were errors.  Easiest way is to check if it's an
 *     object and has error:
 *   
 *         var item = result [x];
 *         if (typeof item === 'object' && 'error' in item)
 *             isError = true;
 */
var validOpt = {
    all: false, // default (false) => throw at first instant
                //     if true => accumulate errors in the result array
                //     (item result is an exception obj) and return
                //     result array at end (or throw it).

    throws: true, // default (true) => if asyncOrNotItemFn throws an
                  //     exception, throws = true means an exception will
                  //     be thrown from forEach.  The value of 'all' opt
                  //     determines whether it is thrown at the first
                  //     error (all = false), or at the end (all = true).
};

PromiseUtil.forEach = function (arr, asyncOrNotItemFn, opt) {
    var options = Opt (validOpt, opt);
    var optAll = options.get ('all');
    var optThrows = options.get ('throws');

    var errorCount = 0;
    var finalArr = [];
    var safeAsyncFn = PromiseUtil.makeAsync (asyncOrNotItemFn);

    // Array.reduce to iterate and pass a promise in as the "accumulator"
    var pr = arr.reduce ((promise, item, idx, theArr) => {
        return promise.then ((result) => {
            return safeAsyncFn (item, idx, theArr)  // safe wrapped fn
            .then (itemRes => {
                finalArr.push (itemRes);      // append item result to arr
                return finalArr;
            })
            .catch (e => {
                errorCount += 1;

                // default is to stop processing with exception
                if ( ! optAll)
                    throw { error: e, item: item, index: idx,
                            result: finalArr };

                // append error in result finalArr
                finalArr.push ({ error: e });
                return finalArr;
            });
        });
    }, Promise.resolve ())    // init arr.reduce accumulator with promise
    .then (finalArr => {
        if (optThrows && errorCount) {
            var msg = `PromiseUtil.forEach had ${ errorCount } errors. ` +
                `The errors are in the array (result)`;
            throw { result: finalArr, errorCount: errorCount,
                    error: msg };
        }

        return finalArr;
    });

    return pr;
}

/**
 * Convenience function for processing unhandled promise rejections.
 * Currently these don't terminate the program (although they should,
 * this is a design flaw with Nodejs and Promises).
 *
 * A much better default handler, which prints out more information
 * may be setup like this:
 * 
 *     PromiseUtil.hookUnhandledPromiseRejection (function (reason, promise) {
 *         console.log (`Unhandled Promise Rejection: `, reason);
 *     }
 *
 * If called with "null" value for arg hookFn, will remove the installed
 * hook function.  This does not disrupt other hook functions on this event.
 */
var _unhandledPromise_UserFn;

PromiseUtil.hookUnhandledPromiseRejection = function (hookFn) {
    if (hookFn === null) {
        if ( ! _unhandledPromise_UserFn)  // no installed handler, so ignore
            return;

        process.removeListener ('unhandledRejection',
            PromiseUtil._handleUnhandledPromiseRejection);

        _unhandledPromise_UserFn = undefined;

        return;
    }

    _unhandledPromise_UserFn = hookFn;

    process.on ('unhandledRejection',
        PromiseUtil._handleUnhandledPromiseRejection);
}

PromiseUtil._handleUnhandledPromiseRejection = function (reason, p) {
    var args = arguments;
    var hookFnBad = false;
    try {
        _unhandledPromise_UserFn.apply (null, args);
    } catch (e) {
        hookFnBad = true;
        console.log (`Error:  the 'hook function' ` +
            `for PromiseUtil.hookUnhandledPromiseRejection threw ` +
            `an exception, in handling the unhandled rejection (` +
            `unhandled rejection shown in next stanza, below). ` +
            `This is a bug in the 'hook function' you supplied. ` +
            `Hook Function Error: `, e, `\n\n`);

        console.log (`Unhandled Promise Rejection: `, reason);
    }
}


var _exit_UserFn;

PromiseUtil.hookExit = function (hookFn) {

    // Same call with 'null' will remove hook
    if (hookFn === null) {
        if ( ! _exit_UserFn)
            return;

        process.removeListener ('exit', PromiseUtil._handleExit);
        _exit_UserFn = undefined;
        return;
    }

    _exit_UserFn = hookFn;

    process.on ('exit', PromiseUtil._handleExit);
}


PromiseUtil._handleExit = function (code) {
    try {
        _exit_UserFn.apply (null, [ code ]);
    } catch (e) {
        console.log (`Error:  the 'hook function' ` +
            `for PromiseUtil.hookExit threw ` +
            `an exception in the 'hook function' you supplied: `, e);

        console.log (`Exit code= `, code);
    }
}

