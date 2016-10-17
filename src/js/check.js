'use strict';

/*eslint-disable no-unused-vars*/
function getMessage(a, b) {
  /*eslint-enable no-unused-vars*/
  var animationGif = 'Переданное GIF-изображение анимировано и содержит ' + b + ' кадров';
  var noAnimationGif = 'Переданное GIF-изображение не анимировано';
  var svgPicture = 'Переданное SVG-изображение содержит ' + a + ' объектов и ' + (b * 4) + ' атрибутов';
  if (typeof a === 'number') {
    return svgPicture;
  } else if (typeof a === 'boolean') {
    if (a) {
      return animationGif;
    } else {
      return noAnimationGif;
    }
  } else if (Array.isArray(a) && !Array.isArray(b)) {
    var amountOfRedPoints = a.reduce(function(sum, current) {
      return sum + current;
    });
    return 'Количество красных точек во всех строчках изображения: ' + amountOfRedPoints;
  } else if (Array.isArray(a) && Array.isArray(b)) {
    var artifactsSquare = a.reduce(function(sum, current, i) {
      return sum + (current * b[i]);
    }, 0);
    return 'Общая площадь артефактов сжатия: ' + artifactsSquare + ' пикселей';
  } else {
    return 'Переданы некорректные данные';
  }
}
