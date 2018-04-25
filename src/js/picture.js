'use strict';

import gallery from './gallery';
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
  const template = document.getElementById('picture-template');
  const templateContainer = 'content' in template ? template.content : template;
  let newImg = new Image();
  let picture = templateContainer.querySelector('.picture').cloneNode(true);
  this.data = pictureData;
  this.element = picture;
  this.element.addEventListener('click', event => {
    gallery.show(number);
    event.preventDefault();
  });

  let pictureImg = picture.querySelector('img');
  pictureImg.src = require(`../assets/photos/${number + 1}.jpg`);
  pictureImg.width = 182;
  pictureImg.height = 182;
  picture.querySelector('.picture-likes').innerHTML = pictureData.likes;
  picture.querySelector('.picture-comments').innerHTML = pictureData.comments;

  newImg.addEventListener('error', () => {
    picture.classList.add('picture-load-failure');
  });
};

export default Picture;
