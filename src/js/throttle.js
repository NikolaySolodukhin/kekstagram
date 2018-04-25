'use strict';

const throttle = function(throttleFunction, time) {
  var lastCall = Date.now();
  return () => {
    if (Date.now() - lastCall >= time) {
      throttleFunction();

      lastCall = Date.now();
    }
  };
};

export default throttle;
