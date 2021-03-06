'use strict';

import Coordinate from './coordinate';
import Square from './square';

class Resizer {
  constructor(image) {
    // Изображение, с которым будет вестись работа.
    this._image = new Image();
    this._image.src = image;
    // Холст.
    this._container = document.createElement('canvas');
    this._ctx = this._container.getContext('2d');
    // Создаем холст только после загрузки изображения.
    this._image.onload = function() {
      // Размер холста равен размеру загруженного изображения. Это нужно
      // для удобства работы с координатами.
      this._container.width = this._image.naturalWidth;
      this._container.height = this._image.naturalHeight;
      /**
       * Предлагаемый размер кадра в виде коэффициента относительно меньшей
       * стороны изображения.
       * @const
       * @type {number}
       */
      const INITIAL_SIDE_RATIO = 0.75;
      // Размер меньшей стороны изображения.
      const side = Math.min(
        this._container.width * INITIAL_SIDE_RATIO,
        this._container.height * INITIAL_SIDE_RATIO
      );
      // Изначально предлагаемое кадрирование — часть по центру с размером в 3/4
      // от размера меньшей стороны.
      this._resizeConstraint = new Square(
        this._container.width / 2 - side / 2,
        this._container.height / 2 - side / 2,
        side
      );
      // Отрисовка изначального состояния канваса.
      this.setConstraint();
    }.bind(this);
    // Фиксирование контекста обработчиков.
    this._onDragStart = this._onDragStart.bind(this);
    this._onDragEnd = this._onDragEnd.bind(this);
    this._onDrag = this._onDrag.bind(this);
  }
}

Resizer.prototype = {
  /**
   * Родительский элемент канваса.
   * @type {Element}
   * @private
   */
  _element: null,

  /**
   * Положение курсора в момент перетаскивания. От положения курсора
   * рассчитывается смещение на которое нужно переместить изображение
   * за каждую итерацию перетаскивания.
   * @type {Coordinate}
   * @private
   */
  _cursorPosition: null,

  /**
   * Объект, хранящий итоговое кадрирование: сторона квадрата и смещение
   * от верхнего левого угла исходного изображения.
   * @type {Square}
   * @private
   */
  _resizeConstraint: null,

  /**
   * Отрисовка канваса.
   */
  redraw() {
    // Очистка изображения.
    this._ctx.clearRect(0, 0, this._container.width, this._container.height);

    // Параметры линии.
    // NB! Такие параметры сохраняются на время всего процесса отрисовки
    // canvas'a поэтому важно вовремя поменять их, если нужно начать отрисовку
    // чего-либо с другой обводкой.

    // Толщина линии.
    this._ctx.lineWidth = 6;
    // Цвет обводки.
    this._ctx.strokeStyle = '#ffe753';
    // Размер штрихов. Первый элемент массива задает длину штриха, второй
    // расстояние между соседними штрихами.
    this._ctx.setLineDash([15, 10]);
    // Смещение первого штриха от начала линии.
    this._ctx.lineDashOffset = 7;

    // Сохранение состояния канваса.
    this._ctx.save();

    // Установка начальной точки системы координат в центр холста.
    this._ctx.translate(this._container.width / 2, this._container.height / 2);

    const displX = -(
      this._resizeConstraint.x +
      this._resizeConstraint.side / 2
    );
    const displY = -(
      this._resizeConstraint.y +
      this._resizeConstraint.side / 2
    );
    // Отрисовка изображения на холсте. Параметры задают изображение, которое
    // нужно отрисовать и координаты его верхнего левого угла.
    // Координаты задаются от центра холста.
    this._ctx.drawImage(this._image, displX, displY);

    // Отрисовка прямоугольника, обозначающего область изображения после
    // кадрирования. Координаты задаются от центра.

    const coordinatesImage =
      -this._resizeConstraint.side / 2 - this._ctx.lineWidth / 2;
    const sizeImage = this._resizeConstraint.side - this._ctx.lineWidth / 2;
    const coordinatesImageLeft = coordinatesImage + 8;
    const coordinatesImageTop = coordinatesImage + 22;
    const sizeImageRight = sizeImage - 8;
    const sizeImageBottom = sizeImage - 35;
    // Установка начальной точки системы координат в левый угол холста.
    this._ctx.translate(
      -this._container.width / 2,
      -this._container.height / 2
    );
    this._ctx.beginPath();
    this._ctx.rect(0, 0, this._container.width, this._container.height);
    this._ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';

    // Установка начальной точки системы координат в центре холста.
    this._ctx.translate(this._container.width / 2, this._container.height / 2);
    this._ctx.rect(
      coordinatesImageLeft,
      coordinatesImageTop,
      sizeImageRight,
      sizeImageBottom
    );
    this._ctx.closePath();
    this._ctx.fill('evenodd');

    // Вывод размера изображения
    this._ctx.font = '16px sans-serif';
    this._ctx.fillStyle = 'white';
    this._ctx.fillText(
      this._image.naturalWidth + ' × ' + this._image.naturalHeight,
      -40,
      coordinatesImage - 10
    );

    this._ctx.translate(
      -this._resizeConstraint.side / 2,
      -this._resizeConstraint.side / 2
    );

    // Ширина, цвет и максимальный размер зига.
    this._ctx.lineWidth = 6;
    this._ctx.lineCap = 'round';
    this._ctx.strokeStyle = '#ffe753';
    const zigM = 20;

    // Сторона области кадрирования
    const side = this._resizeConstraint.side;

    // Находит точный размер зига, чтобы они заполняли сторону рамки без остатка.

    function findZig(zigZ, separatedSide) {
      while (separatedSide > zigZ) {
        separatedSide = separatedSide / 2;
      }
      return separatedSide;
    }

    const zig = findZig(zigM, side);
    function paintZigLine(ctx, xStart, yStart, xEnd, yEnd) {
      let x = xStart;
      let y = yStart;

      if (yStart === yEnd && yStart === 0) {
        while (x < xEnd) {
          paintZag(ctx, x, y);
          paintZig(ctx, x, y);
          x += zig * 2;
        }
      }

      if (xStart === xEnd && xStart === side) {
        while (y < yEnd) {
          paintZag(ctx, x, y);
          paintZig(ctx, x - zig, y + zig);
          y += zig * 2;
        }
      }

      if (yStart === yEnd && yStart === side) {
        while (x < xEnd) {
          paintZig(ctx, x - zig, y - zig);
          paintZag(ctx, x + zig, y - zig);
          x += zig * 2;
        }
      }

      if (xStart === xEnd && xStart === 0) {
        while (y < yEnd) {
          paintZig(ctx, x - zig * 2, y);
          paintZag(ctx, x - zig, y + zig);
          y += zig * 2;
        }
      }
    }

    function paintZig(ctx, x, y) {
      ctx.beginPath();
      ctx.moveTo(x + zig, y + zig);
      ctx.lineTo(x + zig * 2, y);
      ctx.stroke();
    }

    function paintZag(ctx, x, y) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + zig, y + zig);
      ctx.stroke();
    }

    paintZigLine(this._ctx, 0, 0, side, 0);
    paintZigLine(this._ctx, side, 0, side, side);
    paintZigLine(this._ctx, 0, side, side, side);
    paintZigLine(this._ctx, 0, 0, 0, side);

    // Восстановление состояния канваса, которое было до вызова ctx.save
    // и последующего изменения системы координат. Нужно для того, чтобы
    // следующий кадр рисовался с привычной системой координат, где точка
    // 0 0 находится в левом верхнем углу холста, в противном случае
    // некорректно сработает даже очистка холста или нужно будет использовать
    // сложные рассчеты для координат прямоугольника, который нужно очистить.
    this._ctx.restore();
  },

  /**
   * Включение режима перемещения. Запоминается текущее положение курсора,
   * устанавливается флаг, разрешающий перемещение и добавляются обработчики,
   * позволяющие перерисовывать изображение по мере перетаскивания.
   * @param {number} x
   * @param {number} y
   * @private
   */
  _enterDragMode(x, y) {
    this._cursorPosition = new Coordinate(x, y);
    document.body.addEventListener('mousemove', this._onDrag);
    document.body.addEventListener('mouseup', this._onDragEnd);
  },

  /**
   * Выключение режима перемещения.
   * @private
   */
  _exitDragMode() {
    this._cursorPosition = null;
    document.body.removeEventListener('mousemove', this._onDrag);
    document.body.removeEventListener('mouseup', this._onDragEnd);
  },

  /**
   * Перемещение изображения относительно кадра.
   * @param {number} x
   * @param {number} y
   * @private
   */
  updatePosition(x, y) {
    this.moveConstraint(this._cursorPosition.x - x, this._cursorPosition.y - y);
    this._cursorPosition = new Coordinate(x, y);
  },

  /**
   * @param {MouseEvent} evt
   * @private
   */
  _onDragStart(evt) {
    this._enterDragMode(evt.clientX, evt.clientY);
  },

  /**
   * Обработчик окончания перетаскивания.
   * @private
   */
  _onDragEnd() {
    this._exitDragMode();
  },

  /**
   * Обработчик события перетаскивания.
   * @param {MouseEvent} evt
   * @private
   */
  _onDrag(evt) {
    this.updatePosition(evt.clientX, evt.clientY);
  },

  /**
   * Добавление элемента в DOM.
   * @param {Element} element
   */
  setElement(element) {
    if (this._element === element) {
      return;
    }

    this._element = element;
    this._element.insertBefore(this._container, this._element.firstChild);
    // Обработчики начала и конца перетаскивания.
    this._container.addEventListener('mousedown', this._onDragStart);
  },

  /**
   * Возвращает кадрирование элемента.
   * @return {Square}
   */
  getConstraint() {
    return this._resizeConstraint;
  },

  /**
   * Смещает кадрирование на значение указанное в параметрах.
   * @param {number} deltaX
   * @param {number} deltaY
   * @param {number} deltaSide
   */
  moveConstraint(deltaX, deltaY, deltaSide) {
    this.setConstraint(
      this._resizeConstraint.x + (deltaX || 0),
      this._resizeConstraint.y + (deltaY || 0),
      this._resizeConstraint.side + (deltaSide || 0)
    );
  },

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} side
   */
  setConstraint(x, y, side) {
    if (typeof x !== 'undefined') {
      this._resizeConstraint.x = x;
    }

    if (typeof y !== 'undefined') {
      this._resizeConstraint.y = y;
    }

    if (typeof side !== 'undefined') {
      this._resizeConstraint.side = side;
    }

    requestAnimationFrame(
      function() {
        this.redraw();
        const resizerChangeEvent = document.createEvent('CustomEvent');
        resizerChangeEvent.initEvent('resizerchange', false, false);
        window.dispatchEvent(resizerChangeEvent);
      }.bind(this)
    );
  },

  /**
   * Удаление. Убирает контейнер из родительского элемента, убирает
   * все обработчики событий и убирает ссылки.
   */
  remove() {
    this._element.removeChild(this._container);

    this._container.removeEventListener('mousedown', this._onDragStart);
    this._container = null;
  },

  /**
   * Экспорт обрезанного изображения как HTMLImageElement и исходником
   * картинки в src в формате dataURL.
   * @return {Image}
   */
  exportImage() {
    // Создаем Image, с размерами, указанными при кадрировании.
    let imageToExport = new Image();

    // Создается новый canvas, по размерам совпадающий с кадрированным
    // изображением, в него добавляется изображение взятое из канваса
    // с измененными координатами и сохраняется в dataURL, с помощью метода
    // toDataURL. Полученный исходный код, записывается в src у ранее
    // созданного изображения.
    const temporaryCanvas = document.createElement('canvas');
    const temporaryCtx = temporaryCanvas.getContext('2d');
    temporaryCanvas.width = this._resizeConstraint.side;
    temporaryCanvas.height = this._resizeConstraint.side;
    temporaryCtx.drawImage(
      this._image,
      -this._resizeConstraint.x,
      -this._resizeConstraint.y
    );
    imageToExport.src = temporaryCanvas.toDataURL('image/png');

    return imageToExport;
  },
};

export default Resizer;
