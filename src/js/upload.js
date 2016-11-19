/**
 * @fileoverview
 * @author Igor Alexeenko (o0)
 */

'use strict';

var Resizer = require('./resizer');
/** @enum {string} */
var FileType = {
  'GIF': '',
  'JPEG': '',
  'PNG': '',
  'SVG+XML': ''
};

/** @enum {number} */
var Action = {
  ERROR: 0,
  UPLOADING: 1,
  CUSTOM: 2
};

/**
 * Регулярное выражение, проверяющее тип загружаемого файла. Составляется
 * из ключей FileType.
 * @type {RegExp}
 */
var fileRegExp = new RegExp('^image/(' + Object.keys(FileType).join('|').replace('\+', '\\+') + ')$', 'i');

/**
 * @type {Object.<string, string>}
 */
var filterMap;

/**
 * Объект, который занимается кадрированием изображения.
 * @type {Resizer}
 */
var currentResizer;

/**
 * Удаляет текущий объект {@link Resizer}, чтобы создать новый с другим
 * изображением.
 */
var cleanupResizer = function() {
  if (currentResizer) {
    currentResizer.remove();
    currentResizer = null;
  }
};

/**
 * Ставит одну из трех случайных картинок на фон формы загрузки.
 */
var updateBackground = function() {
  var images = [
    'img/logo-background-1.jpg',
    'img/logo-background-2.jpg',
    'img/logo-background-3.jpg'
  ];

  var backgroundElement = document.querySelector('.upload');
  var randomImageNumber = Math.round(Math.random() * (images.length - 1));
  backgroundElement.style.backgroundImage = 'url(' + images[randomImageNumber] + ')';
};
/**
 * Форма загрузки изображения.
 * @type {HTMLFormElement}
 */
var uploadForm = document.forms['upload-select-image'];

/**
 * Форма кадрирования изображения.
 * @type {HTMLFormElement}
 */
var resizeForm = document.forms['upload-resize'];

/**
 * Форма добавления фильтра.
 * @type {HTMLFormElement}
 */
var filterForm = document.forms['upload-filter'];

/**
 * @type {HTMLImageElement}
 */
var filterImage = filterForm.querySelector('.filter-image-preview');

/**
 * @type {HTMLElement}
 */
var uploadMessage = document.querySelector('.upload-message');

var sizeLeft = resizeForm['x'];
var sizeTop = resizeForm['y'];
var sizeLength = resizeForm['size'];
var buttonSubmitState = resizeForm['fwd'];
/**
 * Проверяет, валидны ли данные, в форме кадрирования.
 * @return {boolean}
 */
var resizeFormIsValid = function() {
  var sizeLeftValue = Number(sizeLeft.value);
  var sizeTopValue = Number(sizeTop.value);
  var sizeLengthValue = Number(sizeLength.value);

  var isLeftLengthSumValid = sizeLeftValue + sizeLengthValue <= currentResizer._image.naturalWidth;
  var isTopLengthSumValid = sizeTopValue + sizeLengthValue <= currentResizer._image.naturalHeight;
  var isSizeTopValueValid = sizeTopValue >= 0;
  var isSizeLeftValueValid = sizeLeftValue >= 0;
  var isSizeLengthValueValid = sizeLengthValue >= 0;

  return (isSizeLeftValueValid && isSizeTopValueValid && isSizeLengthValueValid && isLeftLengthSumValid && isTopLengthSumValid);
};

var toggleSubmitButton = function() {
  buttonSubmitState.disabled = !resizeFormIsValid();
};

sizeLeft.addEventListener('input', toggleSubmitButton);
sizeTop.addEventListener('input', toggleSubmitButton);
sizeLength.addEventListener('input', toggleSubmitButton);

/**
 * @param {Action} action
 * @param {string=} message
 * @return {Element}
 */
var showMessage = function(action, message) {
  var isError = false;

  switch (action) {
    case Action.UPLOADING:
      message = message || 'Кексограмим&hellip;';
      break;

    case Action.ERROR:
      isError = true;
      message = message || 'Неподдерживаемый формат файла<br> <a href="' + document.location + '">Попробовать еще раз</a>.';
      break;
  }

  uploadMessage.querySelector('.upload-message-container').innerHTML = message;
  uploadMessage.classList.remove('invisible');
  uploadMessage.classList.toggle('upload-message-error', isError);
  return uploadMessage;
};

var hideMessage = function() {
  uploadMessage.classList.add('invisible');
};

/**
 * Обработчик изменения изображения в форме загрузки. Если загруженный
 * файл является изображением, считывается исходник картинки, создается
 * Resizer с загруженной картинкой, добавляется в форму кадрирования
 * и показывается форма кадрирования.
 * @param {Event} evt
 */
uploadForm.addEventListener('change', function(evt) {
  var element = evt.target;
  if (element.id === 'upload-file') {
    // Проверка типа загружаемого файла, тип должен быть изображением
    // одного из форматов: JPEG, PNG, GIF или SVG.
    if (fileRegExp.test(element.files[0].type)) {
      var fileReader = new FileReader();
      showMessage(Action.UPLOADING);
      fileReader.addEventListener('load', function() {
        cleanupResizer();
        currentResizer = new Resizer(fileReader.result);
        currentResizer.setElement(resizeForm);
        uploadMessage.classList.add('invisible');

        uploadForm.classList.add('invisible');
        resizeForm.classList.remove('invisible');

        hideMessage();
      });

      fileReader.readAsDataURL(element.files[0]);
    } else {
      // Показ сообщения об ошибке, если формат загружаемого файла не поддерживается
      showMessage(Action.ERROR);
    }
  }
});
/**
 * Обработка сброса формы кадрирования. Возвращает в начальное состояние
 * и обновляет фон.
 * @param {Event} evt
 */
resizeForm.addEventListener('reset', function(evt) {
  evt.preventDefault();

  cleanupResizer();
  updateBackground();

  resizeForm.classList.add('invisible');
  uploadForm.classList.remove('invisible');
});

window.addEventListener('resizerchange', function() {
  if (currentResizer) {
    sizeLeft.value = Math.round(currentResizer.getConstraint().x);
    sizeTop.value = Math.round(currentResizer.getConstraint().y);
    sizeLength.value = Math.round(currentResizer.getConstraint().side);
  }
});

var uploadResizeControls = resizeForm.querySelector('.upload-resize-controls');
uploadResizeControls.addEventListener('input', function() {
  var valueX = parseInt(sizeLeft.value, 10);
  var valueY = parseInt(sizeTop.value, 10);
  var valueSize = parseInt(sizeLength.value, 10);

  currentResizer.setConstraint(valueX, valueY, valueSize);
});

/**
 * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
 * кропнутое изображение в форму добавления фильтра и показывает ее.
 * @param {Event} evt
 */
resizeForm.addEventListener('submit', function(evt) {
  evt.preventDefault();

  if (resizeFormIsValid()) {
    var image = currentResizer.exportImage().src;

    var thumbnails = filterForm.querySelectorAll('.upload-filter-preview');
    for (var i = 0; i < thumbnails.length; i++) {
      thumbnails[i].style.backgroundImage = 'url(' + image + ')';
    }

    filterImage.src = image;

    resizeForm.classList.add('invisible');
    filterForm.classList.remove('invisible');

    var filterCookie = window.Cookies.get('upload-filter') || 'none';
    document.getElementById('upload-filter-' + filterCookie).click();
  }
});

/**
 * Сброс формы фильтра. Показывает форму кадрирования.
 * @param {Event} evt
 */
filterForm.addEventListener('reset', function(evt) {
  evt.preventDefault();

  filterForm.classList.add('invisible');
  resizeForm.classList.remove('invisible');
});

/**
 * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
 * записав сохраненный фильтр в cookie.
 * @param {Event} evt
 */
filterForm.addEventListener('submit', function(evt) {
  evt.preventDefault();

  cleanupResizer();
  updateBackground();

  filterForm.classList.add('invisible');
  uploadForm.classList.remove('invisible');
});
var calcCookieExpDate = function() {

  var currentDate = new Date();
  var GraceBDay = new Date(currentDate.getFullYear(), 11, 9);

  if (GraceBDay > currentDate) {
    GraceBDay.setFullYear(GraceBDay.getFullYear() - 1);
  }

  var diffInDays = Math.floor(currentDate - GraceBDay) / (1000 * 3600 * 24);
  return diffInDays;
};


/**
 * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
 * выбранному значению в форме.
 */
filterForm.addEventListener('change', function() {
  if (!filterMap) {
    // Ленивая инициализация. Объект не создается до тех пор, пока
    // не понадобится прочитать его в первый раз, а после этого запоминается
    // навсегда.
    filterMap = {
      'none': 'filter-none',
      'chrome': 'filter-chrome',
      'sepia': 'filter-sepia',
      'marvin': 'filter-marvin'
    };
  }

  var selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
    return item.checked;
  })[0].value;

  window.Cookies.set('upload-filter', selectedFilter, {
    expires: calcCookieExpDate()
  });

  // Класс перезаписывается, а не обновляется через classList потому что нужно
  // убрать предыдущий примененный класс. Для этого нужно или запоминать его
  // состояние или просто перезаписывать.
  filterImage.className = 'filter-image-preview ' + filterMap[selectedFilter];
});

cleanupResizer();
updateBackground();
