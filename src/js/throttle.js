'use strict';

var throttle = function(throttleFunction, time) {
  var lastCall = Date.now();
  return function() {
    if (Date.now() - lastCall >= time) {
      throttleFunction();

      lastCall = Date.now();
    }
  };
};
module.exports = throttle;
