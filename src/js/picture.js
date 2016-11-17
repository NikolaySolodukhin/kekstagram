'use strict';

var gallery = require('./gallery');
/**
 * Создает блок картинки и записывает лайки и комментарии и урлы картинки
 * @param {object} pictureData
 * @param {number} pictureData.likes
 * @param {number} pictureData.comments
 * @param {string} pictureData.url
 * @param {string} pictureData.preview
 * @param {number} number
 * @constructor
 */
var Picture = function(pictureData, number) {
  var template = document.getElementById('picture-template');
  var templateContainer = 'content' in template ? template.content : template;
  var newImg = new Image();
  var picture = templateContainer.querySelector('.picture').cloneNode(true);
  this.data = pictureData;
  this.element = picture;
  this.element.onclick = function(event) {
    gallery.show(number);
    event.preventDefault();
  };

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
};
module.exports = Picture;
