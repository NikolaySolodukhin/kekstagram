'use strict';

import load from './load';
import Picture from './picture';
import gallery from './gallery';
import throttle from './throttle';

const filters = document.querySelector('.filters');
const footer = document.querySelector('.footer');
const picturesContainer = document.querySelector('.pictures');
const PICTURE_LOAD_URL = 'data/data.json';

/** @constant {number} */
const PAGE_SIZE = 12;

/** @constant {number} */
const THROTTLE_TIMEOUT = 100;

/** @constant {number} */
const GAP = 100;

/** @constant {string} */
const DEFAULT_FILTER = 'filter-popular';

/** @type {string} */
let activeFilter = localStorage.getItem('filter') || DEFAULT_FILTER;

/** @type {number} */
let pageNumber = 0;

filters.classList.add('hidden');

const loadPictures = (filter, currentPage) => {
  load(
    PICTURE_LOAD_URL,
    {
      from: currentPage * PAGE_SIZE,
      to: currentPage * PAGE_SIZE + PAGE_SIZE,
      filter: filter,
    },
    pictures => showPictures(pictures)
  );
};

/**
 * Принимает на вход массив с элементами к каждой фотографии/ Записывает все фотографии в один контейнер DocumentFragment и затем добавляет их в DOM
 * @param {object[]} picturesAll
 */

function showPictures(picturesAll) {
  const picturesContainerAll = document.createDocumentFragment();

  picturesAll.forEach((pictureData, number) => {
    picturesContainerAll.appendChild(
      new Picture(pictureData, pageNumber * PAGE_SIZE + number).element
    );
  });

  picturesContainer.appendChild(picturesContainerAll);
  gallery.setPictures(picturesAll);
  document.getElementById(activeFilter).checked = true;
  filters.classList.remove('hidden');
}

/**  Обработчик кликов по фильтрам */
const setFiltersEnabled = () => {
  filters.addEventListener(
    'change',
    event => {
      if (event.target.name !== 'filter') {
        return;
      }
      gallery.clearPictures();
      picturesContainer.innerHTML = '';
      pageNumber = 0;
      activeFilter = event.target.id;
      localStorage.setItem('filter', activeFilter);
      loadPictures(activeFilter, pageNumber);
    },
    true
  );
};

const isFooterVisible = () =>
  footer.getBoundingClientRect().top - window.innerHeight <= GAP;

/** Обработчик прокрутки */
window.addEventListener(
  'scroll',
  throttle(() => {
    if (isFooterVisible()) {
      loadPictures(activeFilter, ++pageNumber);
    }
  }, THROTTLE_TIMEOUT)
);

loadPictures(DEFAULT_FILTER, pageNumber);
setFiltersEnabled();
