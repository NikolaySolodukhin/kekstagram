'use strict';

var template = document.getElementById('picture-template');
var templateContainer = 'content' in template ? template.content : template;
var picturesContainer = document.querySelector('.pictures');
var filters = document.querySelector('.filters');
var PICTURE_LOAD_URL = 'http://localhost:1507/api/pictures';

/**
 * Делает JSONP запрос к серверу и отдает данные в callback
 * @param {string} url
 * @param {function} callback
 *
 */

function load(url, callback) {

  var callbackName = 'JSONPRequest';

  window[callbackName] = function(data) {
    callback(data);
    script.parentNode.removeChild(script);
    delete window[callbackName];
  };

  var script = document.createElement('script');
  script.src = url + '?callback=' + callbackName;
  document.body.appendChild(script);
}

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

/**
 * Создает блок картинки и записывает лайки и комментарии и урлы картинки
 * @param {object} pictureData
 * @param {number} pictureData.likes
 * @param {number} pictureData.comments
 * @param {string} pictureData.url
 * @param {string} pictureData.preview
 *
 * @return {HTMLElement} DOM элемент щаблонизированной картинки
 */

function createPicture(pictureData) {
  var newImg = new Image();
  var picture = templateContainer.querySelector('.picture').cloneNode(true);

  newImg.onload = function() {
    var pictureImg = picture.querySelector('img');
    pictureImg.src = newImg.src;
    pictureImg.width = 182;
    pictureImg.height = 182;
    picture.querySelector('.picture-likes').innerHTML = pictureData.likes;
    picture.querySelector('.picture-comments').innerHTML = pictureData.comments;
  };

  newImg.src = pictureData.preview || pictureData.url;

  newImg.onerror = function() {
    picture.classList.add('picture-load-failure');
  };

  return picture;
}
