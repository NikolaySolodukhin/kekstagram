'use strict';

import Resizer from './resizer';
import * as Cookies from 'js-cookie';

/** @enum {string} */
const FileType = {
  GIF: '',
  JPEG: '',
  PNG: '',
  'SVG+XML': '',
};

/** @enum {number} */
const Action = {
  ERROR: 0,
  UPLOADING: 1,
  CUSTOM: 2,
};

/**
 * Регулярное выражение, проверяющее тип загружаемого файла. Составляется
 * из ключей FileType.
 * @type {RegExp}
 */
const fileRegExp = new RegExp(
  '^image/(' +
    Object.keys(FileType)
      .join('|')
      .replace('+', '\\+') +
    ')$',
  'i'
);

/**
 * @type {Object.<string, string>}
 */
let filterMap;

/**
 * Объект, который занимается кадрированием изображения.
 * @type {Resizer}
 */
let currentResizer;

/**
 * Удаляет текущий объект {@link Resizer}, чтобы создать новый с другим
 * изображением.
 */
const cleanupResizer = () => {
  if (!currentResizer) {
    return;
  }
  currentResizer.remove();
  currentResizer = null;
};

/**
 * Ставит одну из трех случайных картинок на фон формы загрузки.
 */
const updateBackground = () => {
  const images = [
    require('../assets/img/logo-background-1.jpg'),
    require('../assets/img/logo-background-2.jpg'),
    require('../assets/img/logo-background-3.jpg'),
  ];

  const backgroundElement = document.querySelector('.upload');
  const randomImageNumber = Math.round(Math.random() * (images.length - 1));
  backgroundElement.style.backgroundImage =
    'url(' + images[randomImageNumber] + ')';
};
/**
 * Форма загрузки изображения.
 * @type {HTMLFormElement}
 */
const uploadForm = document.forms['upload-select-image'];

/**
 * Форма кадрирования изображения.
 * @type {HTMLFormElement}
 */
const resizeForm = document.forms['upload-resize'];

/**
 * Форма добавления фильтра.
 * @type {HTMLFormElement}
 */
const filterForm = document.forms['upload-filter'];

/**
 * @type {HTMLImageElement}
 */
const filterImage = filterForm.querySelector('.filter-image-preview');

/**
 * @type {HTMLElement}
 */
const uploadMessage = document.querySelector('.upload-message');

const sizeLeft = resizeForm['x'];
const sizeTop = resizeForm['y'];
const sizeLength = resizeForm['size'];
const buttonSubmitState = resizeForm['fwd'];
/**
 * Проверяет, валидны ли данные, в форме кадрирования.
 * @return {boolean}
 */
const resizeFormIsValid = () => {
  const sizeLeftValue = Number(sizeLeft.value);
  const sizeTopValue = Number(sizeTop.value);
  const sizeLengthValue = Number(sizeLength.value);

  const isLeftLengthSumValid =
    sizeLeftValue + sizeLengthValue <= currentResizer._image.naturalWidth;
  const isTopLengthSumValid =
    sizeTopValue + sizeLengthValue <= currentResizer._image.naturalHeight;
  const isSizeTopValueValid = sizeTopValue >= 0;
  const isSizeLeftValueValid = sizeLeftValue >= 0;
  const isSizeLengthValueValid = sizeLengthValue >= 0;

  return (
    isSizeLeftValueValid &&
    isSizeTopValueValid &&
    isSizeLengthValueValid &&
    isLeftLengthSumValid &&
    isTopLengthSumValid
  );
};

const toggleSubmitButton = () => {
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
const showMessage = (action, message) => {
  let isError = false;

  switch (action) {
    case Action.UPLOADING:
      message = message || 'Кексограмим&hellip;';
      break;

    case Action.ERROR:
      isError = true;
      message =
        message ||
        'Неподдерживаемый формат файла<br> <a href="' +
          document.location +
          '">Попробовать еще раз</a>.';
      break;
  }

  uploadMessage.querySelector('.upload-message__container').innerHTML = message;
  uploadMessage.classList.remove('invisible');
  uploadMessage.classList.toggle('upload-message-error', isError);
  return uploadMessage;
};

const hideMessage = () => {
  uploadMessage.classList.add('invisible');
};

/**
 * Обработчик изменения изображения в форме загрузки. Если загруженный
 * файл является изображением, считывается исходник картинки, создается
 * Resizer с загруженной картинкой, добавляется в форму кадрирования
 * и показывается форма кадрирования.
 * @param {Event} evt
 */
uploadForm.addEventListener('change', evt => {
  let element = evt.target;
  if (element.id === 'upload-file') {
    // Проверка типа загружаемого файла, тип должен быть изображением
    // одного из форматов: JPEG, PNG, GIF или SVG.
    if (fileRegExp.test(element.files[0].type)) {
      const fileReader = new FileReader();
      showMessage(Action.UPLOADING);
      fileReader.addEventListener('load', () => {
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
resizeForm.addEventListener('reset', evt => {
  evt.preventDefault();

  cleanupResizer();
  updateBackground();

  resizeForm.classList.add('invisible');
  uploadForm.classList.remove('invisible');
});

window.addEventListener('resizerchange', () => {
  if (!currentResizer) {
    return;
  }

  sizeLeft.value = Math.round(currentResizer.getConstraint().x);
  sizeTop.value = Math.round(currentResizer.getConstraint().y);
  sizeLength.value = Math.round(currentResizer.getConstraint().side);
});

const uploadResizeControls = resizeForm.querySelector(
  '.upload-resize__list-control'
);

uploadResizeControls.addEventListener('input', () => {
  const valueX = parseInt(sizeLeft.value, 10);
  const valueY = parseInt(sizeTop.value, 10);
  const valueSize = parseInt(sizeLength.value, 10);

  currentResizer.setConstraint(valueX, valueY, valueSize);
});

/**
 * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
 * кропнутое изображение в форму добавления фильтра и показывает ее.
 * @param {Event} evt
 */
resizeForm.addEventListener('submit', evt => {
  evt.preventDefault();

  if (resizeFormIsValid()) {
    const image = currentResizer.exportImage().src;

    const thumbnails = filterForm.querySelectorAll('.upload-filter__preview');
    for (let i = 0; i < thumbnails.length; i++) {
      thumbnails[i].style.backgroundImage = 'url(' + image + ')';
    }

    filterImage.src = image;

    resizeForm.classList.add('invisible');
    filterForm.classList.remove('invisible');

    const filterCookie = Cookies.get('upload-filter') || 'none';
    document.getElementById('upload-filter-' + filterCookie).click();
  }
});

/**
 * Сброс формы фильтра. Показывает форму кадрирования.
 * @param {Event} evt
 */
filterForm.addEventListener('reset', evt => {
  evt.preventDefault();

  filterForm.classList.add('invisible');
  resizeForm.classList.remove('invisible');
});

/**
 * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
 * записав сохраненный фильтр в cookie.
 * @param {Event} evt
 */
filterForm.addEventListener('submit', evt => {
  evt.preventDefault();

  cleanupResizer();
  updateBackground();

  filterForm.classList.add('invisible');
  uploadForm.classList.remove('invisible');
});

const calcCookieExpDate = () => {
  const currentDate = new Date();
  const GraceBDay = new Date(currentDate.getFullYear(), 11, 9);

  if (GraceBDay > currentDate) {
    GraceBDay.setFullYear(GraceBDay.getFullYear() - 1);
  }

  const diffInDays = Math.floor(currentDate - GraceBDay) / (1000 * 3600 * 24);
  return diffInDays;
};

/**
 * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
 * выбранному значению в форме.
 */
filterForm.addEventListener('change', () => {
  if (!filterMap) {
    // Ленивая инициализация. Объект не создается до тех пор, пока
    // не понадобится прочитать его в первый раз, а после этого запоминается
    // навсегда.
    filterMap = {
      none: 'filter-none',
      chrome: 'filter-chrome',
      sepia: 'filter-sepia',
      marvin: 'filter-marvin',
    };
  }

  const selectedFilter = [].filter.call(
    filterForm['upload-filter'],
    item => item.checked
  )[0].value;

  Cookies.set('upload-filter', selectedFilter, {
    expires: calcCookieExpDate(),
  });

  // Класс перезаписывается, а не обновляется через classList потому что нужно
  // убрать предыдущий примененный класс. Для этого нужно или запоминать его
  // состояние или просто перезаписывать.
  filterImage.className = 'filter-image__preview ' + filterMap[selectedFilter];
});

cleanupResizer();
updateBackground();
