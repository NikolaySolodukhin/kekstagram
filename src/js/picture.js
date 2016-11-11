'use strict';
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

module.exports = function createPicture(pictureData) {
  var template = document.getElementById('picture-template');
  var templateContainer = 'content' in template ? template.content : template;
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
};
