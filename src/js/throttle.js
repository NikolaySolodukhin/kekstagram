'use strict';

const throttle = (throttleFunction, time) => {
  let lastCall = Date.now();
  return () => {
    if (Date.now() - lastCall >= time) {
      throttleFunction();

      lastCall = Date.now();
    }
  };
};

export default throttle;
