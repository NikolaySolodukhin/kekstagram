'use strict';
/**
 *
 * @constructor
 */
var Gallery = function() {
  this.activePicture = 0;
  this.allPictures = [];
  this.overlay = document.querySelector('.gallery-overlay');
  this.overlayClose = document.querySelector('.gallery-overlay-close');
  this.overlayImage = document.querySelector('.gallery-overlay-image');
};

Gallery.prototype.setPictures = function(arrayData) {
  this.allPictures = this.allPictures.concat(arrayData);
};

Gallery.prototype.clearPictures = function() {
  this.allPictures = [];
};

Gallery.prototype.show = function(number) {
  var self = this;
  this.overlayClose.onclick = function() {
    self.hide();
  };
  this.overlayImage.onclick = function() {
    self.setActivePicture((self.activePicture + 1) % self.allPictures.length);
  };
  this.overlay.classList.remove('invisible');
  this.setActivePicture(number);
};

Gallery.prototype.hide = function() {
  this.overlay.classList.add('invisible');
  this.overlayClose.onclick = null;
  this.overlayImage.onclick = null;
};

Gallery.prototype.setActivePicture = function(number) {
  this.pictureLikes = this.overlay.querySelector('.likes-count');
  this.pictureComments = this.overlay.querySelector('.comments-count');
  this.activePicture = number;
  this.overlayImage.src = this.allPictures[number].url;
  this.pictureLikes.textContent = this.allPictures[number].likes;
  this.pictureComments.textContent = this.allPictures[number].comments;
};

module.exports = new Gallery();
