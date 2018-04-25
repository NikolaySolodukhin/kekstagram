'use strict';

import sliceData from './sliceData';
import filter from './filter';
import createdDataTime from './createdDataTime';
/**
 *Делает XMLHttp запрос к серверу и отдает данные в callback
 * @param {string} url
 * @param {object} params
 * @param {function} callback
 */

function load(url, parametersFilter, callback) {
  fetch(`${PUBLIC_URL}${url}`)
    .then(res => res.json())
    .then(data => {
      callback(
        filter(
          sliceData(
            createdDataTime(data),
            parametersFilter.from,
            parametersFilter.to
          ),
          parametersFilter.filter
        )
      );
    });
}

export default load;
