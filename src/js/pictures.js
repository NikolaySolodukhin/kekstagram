'use strict';

var load = require('./load');
var Picture = require('./picture');
var gallery = require('./gallery');
var throttle = require('./throttle');

var filters = document.querySelector('.filters');
var footer = document.querySelector('.footer');
var picturesContainer = document.querySelector('.pictures');
var PICTURE_LOAD_URL = 'http://localhost:1507/api/pictures';

/** @constant {number} */
var PAGE_SIZE = 12;

/** @constant {number} */
var THROTTLE_TIMEOUT = 100;

/** @constant {number} */
var GAP = 180;

/** @constant {string} */
var DEFAULT_FILTER = 'filter-popular';

/** @type {string} */
var activeFilter = DEFAULT_FILTER;

/** @type {number} */
var pageNumber = 0;

filters.classList.add('hidden');

var loadPictures = function(filter, currentPage) {
  load(PICTURE_LOAD_URL, {
    from: currentPage * PAGE_SIZE,
    to: currentPage * PAGE_SIZE + PAGE_SIZE,
    filter: filter
  }, function(pictures) {
    showPictures(pictures);
    filters.classList.remove('hidden');
  });
};
/**
 * Принимает на вход массив с элементами к каждой фотографии/ Записывает все фотографии в один контейнер DocumentFragment и затем добавляет их в DOM
 * @param {object[]} picturesAll
 */

function showPictures(picturesAll) {

  var picturesContainerAll = document.createDocumentFragment();
  picturesAll.forEach(function(pictureData, number) {
    picturesContainerAll.appendChild(new Picture(pictureData, number).element);
  });

  picturesContainer.appendChild(picturesContainerAll);
  gallery.setPictures(picturesAll);
}

/**  Обработчик кликов по фильтрам */
var setFiltersEnabled = function() {
  filters.addEventListener('change', function(event) {
    if (event.target.name === 'filter') {
      gallery.clearPictures();
      picturesContainer.innerHTML = '';
      pageNumber = 0;
      activeFilter = event.target.id;
      loadPictures(activeFilter, pageNumber);
    }
  }, true);
};

var isFooterVisible = function() {
  return (footer.getBoundingClientRect().top - window.innerHeight) <= GAP;
};
/** Обработчик прокрутки */
window.addEventListener('scroll', throttle(function() {
  if (isFooterVisible()) {
    loadPictures(activeFilter, ++pageNumber);
  }
}, THROTTLE_TIMEOUT));

loadPictures(DEFAULT_FILTER, pageNumber);
setFiltersEnabled();
