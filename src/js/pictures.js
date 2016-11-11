'use strict';

var load = require('./load');
var createPicture = require('./picture');

var filters = document.querySelector('.filters');
var picturesContainer = document.querySelector('.pictures');
var PICTURE_LOAD_URL = 'http://localhost:1507/api/pictures';

filters.classList.add('hidden');

load(PICTURE_LOAD_URL, function(pictures) {
  showPictures(pictures);
  filters.classList.remove('hidden');
});
/**
 * Принимает на вход массив с элементами к каждой фотографии/ Записывает все фотографии в один контейнер DocumentFragment и затем добавляет их в DOM
 * @param {object[]} picturesAll
 */

function showPictures(picturesAll) {

  var picturesContainerAll = document.createDocumentFragment();

  picturesAll.forEach(function(pictureData) {
    picturesContainerAll.appendChild(createPicture(pictureData));
  });

  picturesContainer.appendChild(picturesContainerAll);
}
