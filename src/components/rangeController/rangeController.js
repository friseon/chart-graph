import './rangeController.scss';

import {
    debounce
} from './../../utils';

class RangeController {
    constructor(params) {
        const rangePanel = document.createElement('div');
        rangePanel.classList.add('range-panel');

        const range = document.createElement('div');
        range.classList.add('range-marker');

        this.rangeBox = document.createElement('div');
        this.rangeBox.classList.add('range-box');

        // выставляем стартовые позиции для диапазона
        this.currentCoords = {
            start: params.width * .3,
            end: params.width * .6
        };

        this.rangeMarkerStart = range.cloneNode(true);
        this.rangeMarkerStart.classList.add('marker-start');
        this.rangeMarkerEnd = range.cloneNode(true);
        this.rangeMarkerEnd.classList.add('marker-end');
        // callback для графика
        this.onUpdate = params.onUpdate;

        rangePanel.appendChild(this.rangeMarkerStart);
        rangePanel.appendChild(this.rangeBox);
        rangePanel.appendChild(this.rangeMarkerEnd);

        params.container.appendChild(rangePanel);

        this.container = rangePanel;
        this.step = params.step;
        this.width = params.width;
    }

    init() {
        const containerParams = this.container.getBoundingClientRect();

        // куда нельзя выходить маркерам диапазона
        this.limits = {
            left: 0,
            right: containerParams.width
        };

        this.rangeMarkerStart.addEventListener('pointerdown', (eventStart) => this._onStartMoveMarkerPosition(eventStart, 'start'));
        this.rangeMarkerEnd.addEventListener('pointerdown', (eventStart) => this._onStartMoveMarkerPosition(eventStart, 'end'));
        this.rangeBox.addEventListener('pointerdown', (eventStart) => this._onStartMoveRangeBox(eventStart));

        this._updateRangePositionForChartPoints();
        // callback для графика
        this.onUpdate(this.currentCoords)
    }

    /**
     * Начало взаимодействие с блоком диапазона
     * 
     * @param {Event} eventStart 
     */
    _onStartMoveRangeBox(eventStart) {
        this._onStartMoveMarkerPosition(eventStart, 'start', true);
        this._onStartMoveMarkerPosition(eventStart, 'end', true);
    }

    /**
     * Взаимодействие с маркером диапазона
     * 
     * @param {Event} eventStart 
     * @param {String} type - тип маркера
     * @param {Boolean} isBox - двигаем диапазон целиком
     */
    _onStartMoveMarkerPosition(eventStart, type, isBox) {
        const _onMoveMarkerMethod = (eventMove) => {
            this._onMarkerMove.call(this, eventMove, type)
        };

        const _onStopMoveMarker = () => {
            document.removeEventListener('pointermove', _onMoveMarkerMethod);
            document.removeEventListener('pointerup', _onStopMoveMarker);
            this._updateRangePositionForChartPoints(isBox);

            // callback для графика
            this.onUpdate(this.currentCoords)
        }

        document.addEventListener('pointermove', _onMoveMarkerMethod);
        document.addEventListener('pointerup', _onStopMoveMarker);

        this.currentCoords[type] = eventStart.clientX;
    }

    _getMarkerNewPosition(shift, type) {
        const current = type === 'start' ? this.rangeMarkerStart.offsetWidth : this.rangeMarkerEnd.offsetLeft
        let newCoords = current - shift;

        if (type === 'start' && newCoords > this.rangeMarkerEnd.offsetLeft - 20) {
            // не двигаем начальный маркер дальше конечного
            newCoords = this.rangeMarkerEnd.offsetLeft - 20;
        }
        if (type === 'end' && newCoords < this.rangeMarkerStart.offsetWidth + 20) {
            // не двигаем конечный маркер дальше начального
            newCoords = this.rangeMarkerStart.offsetWidth + 20;
        }

        // не выходим за границы графика
        if (newCoords > this.limits.right - 8) {
            newCoords = this.limits.right - 8;
        }
        if (newCoords < this.limits.left) {
            newCoords = this.limits.left;
        }

        return newCoords;
    }

    /**
     * Обноволяем позицию диапазона, привязывая его к якорным точкам графика (шаг)
     * 
     * @param {Boolean} isBox - целиком ли диапазон двигаем
     */
    _updateRangePositionForChartPoints(isBox) {
        const start = isBox ? this.rangeMarkerStart.offsetWidth : this.currentCoords.start;
        const end = isBox ? this.rangeMarkerEnd.offsetLeft : this.currentCoords.end;

        this.currentCoords.start = Math.round(start / this.step) * this.step;
        this.currentCoords.end = Math.round(end / this.step) * this.step;

        if (this.currentCoords.end >= this.limits.right) {
            this.currentCoords.end = this.limits.right - 8;
        }

        this.rangeMarkerStart.style.right = this.width - this.currentCoords.start  + 'px';
        this.rangeMarkerEnd.style.left = this.currentCoords.end + 'px';

        this.rangeBox.style.left = this.rangeMarkerStart.offsetWidth + 'px';
        this.rangeBox.style.right = this.rangeMarkerEnd.offsetWidth + 'px';
    }

    /**
     * Новые координаты маркера во время движения
     * 
     * @param {Number} coords - новые координаты
     * @param {String} type - тип маркера
     */
    _setMarkerPosition(coords, type) {
        if (type === 'start') {
            this.rangeMarkerStart.style.right = this.width - coords  + 'px';
        }
        if (type === 'end') {
            this.rangeMarkerEnd.style.left = coords + 'px';
        }

        this.rangeBox.style.left = this.rangeMarkerStart.offsetWidth + 'px';
        this.rangeBox.style.right = this.rangeMarkerEnd.offsetWidth + 'px';

        // TODO: 8 - магическое число (ширина стороны маркера). ну и в других местах тоже глянуть
        debounce(() => this.onUpdate({
            start: this.rangeMarkerStart.offsetWidth - 8,
            end: this.rangeMarkerEnd.offsetLeft + 8
        }), 100)()
    }

    _onMarkerMove(e, type) {
        const coord = this.currentCoords[type];
        const shift = coord - e.clientX;

        const newCoords = this._getMarkerNewPosition(shift, type);

        this._setMarkerPosition(newCoords, type);

        this.currentCoords[type] = e.clientX;
    }
}


export default RangeController;
