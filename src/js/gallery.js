'use strict';
/**
 *
 * @constructor
 */
var Gallery = function() {
  this.activePicture = 0;
  this.allPictures = [];
  this.overlay = document.querySelector('.gallery-overlay');
  this.overlayClose = this.overlay.querySelector('.gallery-overlay-close');
  this.overlayImage = this.overlay.querySelector('.gallery-overlay-image');
  this.hide = this.hide.bind(this);
  this.show = this.show.bind(this);
  this.onGalleryImageClick = this.onGalleryImageClick.bind(this);
};

Gallery.prototype.setPictures = function(arrayData) {
  this.allPictures = this.allPictures.concat(arrayData);
};

Gallery.prototype.clearPictures = function() {
  this.allPictures = [];
};

Gallery.prototype.show = function(number) {
  this.overlayClose.addEventListener('click', this.hide);
  this.overlayImage.addEventListener('click', this.onGalleryImageClick);
  this.overlay.classList.remove('invisible');
  this.setActivePicture(number);
};

Gallery.prototype.onGalleryImageClick = function() {
  this.setActivePicture((this.activePicture + 1) % this.allPictures.length);
};

Gallery.prototype.hide = function() {
  this.overlay.classList.add('invisible');
  this.overlayClose.addEventListener('click', null);
  this.overlayImage.addEventListener('click', null);
};

Gallery.prototype.setActivePicture = function(number) {
  this.activePicture = number;
  this.overlayImage.src = require(`../assets/photos/${number + 1}.jpg`);
  this.overlay.querySelector('.likes-count').textContent = this.allPictures[
    number
  ].likes;
  this.overlay.querySelector('.comments-count').textContent = this.allPictures[
    number
  ].comments;
};

export default new Gallery();
