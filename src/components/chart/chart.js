import {
    getMax,
    getMin,
    hexToRgbA
} from './../../utils';

import {
    state,
    chartColors
} from './../../config/config';

class Chart {
    constructor(params) {
        const canvas = document.createElement('canvas');

        canvas.id = params.idCanvas;

        params.container.appendChild(canvas);

        this.width = canvas.width = params.width || 800;
        this.height = canvas.height = params.height || 600;

        this.ctx = canvas.getContext('2d');
        this.ctx.lineJoin = this.ctx.lineCap = 'round';

        this.lineColor = chartColors.line[state.currentTheme];
        this.chartParams = {
            paddings: params.paddings
        }
        this._bottom = this.height;

        if (params.paddings) {
            this._bottom = this.height - params.paddings.bottom || 0;
        }

        this._setOriginalChartState(params.data);

        this._index = 0;
    }

    updateTheme() {
        this.clear();
        this._draw();
    }

    /**
     * Перевод значения в данных на отображение в графике
     * 
     * @param {Number} val – значение в данных
     */
    getYFromPointValue(val) {
        const result = this._bottom + (val - this.currentChartState.min) * this.currentChartState.kY;

        return result;
    }

    /**
     * Подготовка данных
     * 
     * @param {Array} data – сырые данные
     */
    _setOriginalChartState(data) {
        const max = getMax(data.lines);
        const min = getMin(data.lines);
        const step = this.width / (data.dates.length - 1);

        this.originalChartState = {
            dates: data.dates,
            max,
            min,
            step,
            kY: (-this._bottom) / (max - min),
        };
        this.currentChartState = {...this.originalChartState};
        this.currentChartData = this._setCoords(data.lines, step);
    }

    _setCoords(lines, step) {
        return lines.map(line => {
            line.opacity = 1;

            line.coords = line.data.map((point, index) => {
                return {
                    x: step * index,
                    y: this.getYFromPointValue(point)
                }
            });

            return line;
        });
    }

    /**
     * Отрисовка графика
     */
    _draw() {
        this._drawCharts();
    }

    _getUpdatedFilter(params) {
        let updatedFilter;

        if (!this.currentChartState || !this.currentChartState.filters) {
            return;
        }

        Object.keys(params.filters).forEach(filterName => {
            if (this.currentChartState.filters[filterName] !== params.filters[filterName]) {
                updatedFilter = filterName;

                return;
            }
        });

        return updatedFilter
    }

    redraw(params) {
        this.clear();
        this._updatingChart(params);
        this._draw();

        if (!this._isStop) {
            this._reqId = window.requestAnimationFrame(() => this.redraw(params));
        }
    }

    /**
     * Отрисовка линий графика
     */
    _drawCharts() {
        this.currentChartData.forEach(line => {
            line.coords.forEach((item, index) => {
                if (index === 0) {
                    this._startLine(item.x, item.y, hexToRgbA(line.color, line.opacity), 1.5);
                } else {
                    this.ctx.lineTo(item.x, item.y);
                }
            });
            this.ctx.stroke();
        });
    }

    /**
     * Начало линии
     * 
     * @param {Number} startX 
     * @param {Number} startY 
     * @param {String} color 
     * @param {Number} lineWidth 
     */
    _startLine(startX, startY, color, lineWidth = 1) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.moveTo(startX, startY);
    }

    /**
     * Рисование линии к координатам
     * 
     * @param {Number} endX 
     * @param {Number} endY 
     */
    _drawLine(endX, endY) {
        this.ctx.lineTo(endX, endY);
    }

    /**
     * Очистка холста
     */
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
}

export default Chart;