'use strict';
/**
 *Формирует get  параметры для XMLHttp запроса
 * @param {object} params
 * @returns {string}
 */
function getSearchString(params) {
  return Object.keys(params).map(function(param) {
    return [param, params[param]].join('=');
  }).join('&');
}
/**
 *Делает XMLHttp запрос к серверу и отдает данные в callback
 * @param {string} url
 * @param {object} params
 * @param {function} callback
 */
var load = function(url, params, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url + '?' + getSearchString(params));
  xhr.addEventListener('load', function(evt) {
    var loadedData = JSON.parse(evt.target.response);
    callback(loadedData);
  });
  xhr.send();
};
module.exports = load;
