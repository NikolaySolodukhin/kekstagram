'use strict';
class Gallery {
  constructor() {
    this.activePicture = 0;
    this.allPictures = [];
    this.overlay = document.querySelector('.gallery-overlay');
    this.overlayClose = this.overlay.querySelector(
      '.gallery-overlay__button--close'
    );
    this.overlayImage = this.overlay.querySelector('.gallery-overlay__image');
    this.hide = this.hide.bind(this);
    this.show = this.show.bind(this);
    this.onGalleryImageClick = this.onGalleryImageClick.bind(this);
  }

  setPictures(arrayData) {
    this.allPictures = this.allPictures.concat(arrayData);
  }

  clearPictures() {
    this.allPictures = [];
  }

  setActivePicture(number) {
    this.activePicture = number;
    this.overlayImage.src = require(`../assets/photos/${number + 1}.jpg`);
    this.overlay.querySelector('.likes__count').textContent = this.allPictures[
      number
    ].likes;
    this.overlay.querySelector(
      '.comments__count'
    ).textContent = this.allPictures[number].comments;
  }

  show(number) {
    this.overlayClose.addEventListener('click', this.hide);
    this.overlayImage.addEventListener('click', this.onGalleryImageClick);
    this.overlay.classList.remove('invisible');
    this.setActivePicture(number);
  }

  onGalleryImageClick() {
    this.setActivePicture((this.activePicture + 1) % this.allPictures.length);
  }

  hide() {
    this.overlay.classList.add('invisible');
    this.overlayClose.addEventListener('click', null);
    this.overlayImage.addEventListener('click', null);
  }
}

export default new Gallery();
