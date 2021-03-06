import './rangeController.scss';

import {
    eventBuilder
} from './../../utils';

import {
    chartColors, state
} from '../../config/config';

class RangeController {
    constructor(params) {
        const fragment = document.createDocumentFragment();
        const rangePanel = document.createElement('div');
        rangePanel.classList.add('range-panel');

        const range = document.createElement('div');
        range.classList.add('range-marker');

        this.rangeBox = document.createElement('div');
        this.rangeBox.classList.add('range-box');
        this.rangeBox.style.borderColor = chartColors.rangeBox[state.currentTheme];

        // выставляем стартовые позиции для диапазона
        this.currentCoords = {
            start: params.width * .3,
            end: params.width * .6
        };

        this.rangeMarkerStart = range.cloneNode(true);
        this.rangeMarkerStart.classList.add('marker-start');
        this.rangeMarkerStart.style.backgroundColor = chartColors.range[state.currentTheme];
        this.rangeMarkerStart.style.borderColor = chartColors.rangeBox[state.currentTheme];
        this.rangeMarkerEnd = range.cloneNode(true);
        this.rangeMarkerEnd.classList.add('marker-end');
        this.rangeMarkerEnd.style.backgroundColor = chartColors.range[state.currentTheme];
        this.rangeMarkerEnd.style.borderColor = chartColors.rangeBox[state.currentTheme];
        // callback для графика
        this.onUpdate = params.onUpdate;

        fragment.appendChild(this.rangeMarkerStart);
        fragment.appendChild(this.rangeBox);
        fragment.appendChild(this.rangeMarkerEnd);
        rangePanel.appendChild(fragment);

        params.container.appendChild(rangePanel);

        this.container = rangePanel;
        this.step = params.step;
        this.width = params.width;
    }

    init() {
        // куда нельзя выходить маркерам диапазона
        this.limits = {
            left: 0,
            right: this.container.offsetWidth
        };

        eventBuilder.addEventListener(this.rangeMarkerStart, 'start', (eventStart) => this._onStartMoveMarkerPosition(eventStart, 'start'));
        eventBuilder.addEventListener(this.rangeMarkerEnd, 'start', (eventStart) => this._onStartMoveMarkerPosition(eventStart, 'end'));
        eventBuilder.addEventListener(this.rangeBox, 'start', (eventStart) => this._onStartMoveRangeBox(eventStart));

        this._updateRangePositionForChartPoints();
        // callback для графика
        this.onUpdate(this.currentCoords, true)
    }

    updateTheme() {
        this.rangeMarkerStart.style.backgroundColor = chartColors.range[state.currentTheme];
        this.rangeMarkerStart.style.borderColor = chartColors.rangeBox[state.currentTheme];
        this.rangeMarkerEnd.style.backgroundColor = chartColors.range[state.currentTheme];
        this.rangeMarkerEnd.style.borderColor = chartColors.rangeBox[state.currentTheme];
        this.rangeBox.style.borderColor = chartColors.rangeBox[state.currentTheme];
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
            this._onMarkerMove.call(this, eventMove, type, isBox)
        };

        const _onStopMoveMarker = () => {
            eventBuilder.removeEventListener(document, 'move', _onMoveMarkerMethod);
            eventBuilder.removeEventListener(document, 'end', _onStopMoveMarker);
            this._updateRangePositionForChartPoints(isBox);

            // callback для графика
            this.onUpdate(this.currentCoords)
        }

        eventBuilder.addEventListener(document, 'move', _onMoveMarkerMethod);
        eventBuilder.addEventListener(document, 'end', _onStopMoveMarker);

        this.currentCoords[type] = eventStart.pageX - this.container.offsetLeft;
    }

    _getMarkerNewPosition(shift, type) {
        const current = type === 'start' ? this.rangeMarkerStart.offsetWidth : this.rangeMarkerEnd.offsetLeft
        let newCoords = current - shift;

        if (type === 'start' && newCoords > this.rangeMarkerEnd.offsetLeft - 20) {
            // не двигаем начальный маркер дальше конечного
            newCoords = this.rangeMarkerEnd.offsetLeft - 20;
        } else if (type === 'end' && newCoords < this.rangeMarkerStart.offsetWidth + 20) {
            // не двигаем конечный маркер дальше начального
            newCoords = this.rangeMarkerStart.offsetWidth + 20;
        }

        // не выходим за границы графика
        if (newCoords > this.limits.right - 8) {
            newCoords = this.limits.right - 8;
        } else if (newCoords < this.limits.left) {
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

        this.rangeMarkerStart.style.right = Math.round(this.width - this.currentCoords.start)  + 'px';
        this.rangeMarkerEnd.style.left = Math.round(this.currentCoords.end) + 'px';

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
            this.rangeMarkerStart.style.right = this.width - coords + 'px';
        }
        if (type === 'end') {
            this.rangeMarkerEnd.style.left = coords + 'px';
        }

        this.rangeBox.style.left = this.rangeMarkerStart.offsetWidth + 'px';
        this.rangeBox.style.right = this.rangeMarkerEnd.offsetWidth + 'px';

        this.onUpdate({
            start: this.rangeMarkerStart.offsetWidth - 8,
            end: this.rangeMarkerEnd.offsetLeft + 8
        });
    }

    _onMarkerMove(e, type, isBox) {
        const coord = this.currentCoords[type];
        const shift = coord + this.container.offsetLeft - e.pageX;

        const newCoords = this._getMarkerNewPosition(shift, type);

        this._setMarkerPosition(Math.round(newCoords), type);

        this.currentCoords[type] = isBox ? e.pageX - this.container.offsetLeft : newCoords;
    }
}


export default RangeController;
