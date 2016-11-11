'use strict';

/**
 * Делает JSONP запрос к серверу и отдает данные в callback
 * @param {string} url
 * @param {function} callback
 */

module.exports = function load(url, callback) {

  var callbackName = 'JSONPRequest';

  window[callbackName] = function(data) {
    callback(data);
    script.parentNode.removeChild(script);
    delete window[callbackName];
  };

  var script = document.createElement('script');
  script.src = url + '?callback=' + callbackName;
  document.body.appendChild(script);
};
