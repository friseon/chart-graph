import {
    getMax
} from './../../utils';

class Chart {
    constructor(params) {
        const canvas = document.createElement('canvas');

        canvas.id = params.idCanvas;

        params.container.appendChild(canvas);

        this.width = canvas.width = params.width || 800;
        this.height = canvas.height = params.height || 600;

        this.ctx = canvas.getContext('2d');

        this.lineColor = params.lineColor;

        this._prepareChartParams(params.data);
    }

    /**
     * Подготовка данных
     * 
     * @param {Array} data – сырые данные
     */
    _prepareChartParams(data) {
        const max = getMax(data.lines);

        this.lines = data.lines;
        this.chartParams = {
            dates: data.dates,
            max,
            step: this.width / (data.dates.length - 1)
        };
    }

    /**
     * Отрисовка графика
     */
    draw() {
        // this._drawBackground();
        this._drawCharts();
    }

    redraw(data) {
        this._prepareChartParams(data);
        this.clear();
        this.draw();
    }

    /**
     * Перевод значения в данных на отображение в графике
     * 
     * @param {Number} val – значение в данных
     */
    _prepareValue(val) {
        const p = this.height - this.chartParams.padding.top - this.chartParams.padding.bottom;

        return this.height - p / this.chartParams.max * val - this.chartParams.padding.bottom;
    }

    /**
     * Отрисовка линий графика
     */
    _drawCharts() {
        this.lines.forEach(line => {
            line.data.forEach((y, index, arr) => {
                const preparedValue = this._prepareValue(y);

                if (index === 0) {
                    this._startLine(0, preparedValue, line.color);
                } else {
                    this._drawLine(this.chartParams.step * index, preparedValue);
                }
            })
        });
    }

    /**
     * Подложка для графика (TODO: не нужна...)
     */
    _drawBackground() {
        this.ctx.fillStyle = this.colors.bg;
        this.ctx.fillRect(0, 0, this.width, this.height);
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
        this.ctx.lineJoin = this.ctx.lineCap = 'round';
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();
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
        this.ctx.stroke();
    }

    /**
     * Очистка холста
     */
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
}

export default Chart;