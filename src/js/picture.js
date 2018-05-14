'use strict';

import gallery from './gallery';

class Picture {
  constructor(pictureData, number) {
    const template = document.getElementById('picture-template');
    const templateContainer =
      'content' in template ? template.content : template;

    let newImg = new Image();
    const picture = templateContainer.querySelector('.picture').cloneNode(true);

    this.data = pictureData;
    this.element = picture;
    this.element.addEventListener('click', event => {
      gallery.show(number);
      event.preventDefault();
    });

    const pictureImg = picture.querySelector('img');

    pictureImg.src = require(`../assets/photos/${number + 1}.jpg`);
    pictureImg.width = 182;
    pictureImg.height = 182;
    picture.querySelector('.picture__stat--likes').innerHTML =
      pictureData.likes;
    picture.querySelector('.picture__stat--comments').innerHTML =
      pictureData.comments;
    newImg.addEventListener('error', () => {
      picture.classList.add('picture-load-failure');
    });
  }
}

export default Picture;
