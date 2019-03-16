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

        this.colors = {
            bg: params.bgColors || {
                day: '#f5f5f5',
                night: '#333'
            }
        };

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
            step: this.width / data.dates.length
        };
    }

    /**
     * Отрисовка графика
     */
    draw() {
        this._drawBackground();
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

                    if (index === arr.length - 1) {
                        this._endDraw();
                    }
                }
            })
        });
    }

    /**
     * Рисование горизонтальных разделителей
     */
    _drawDividers() {
        this.chartParams.deviders.forEach(devider => {
            const preparedValue = this._prepareValue(devider);

            this._startLine(0, preparedValue, '#f5f5f5', 0.5);
            this.ctx.font = '12px Arial';
            this.ctx.fillStyle = '#f5f5f5';
            this.ctx.fillText(devider, 5, preparedValue - 5);
            this._drawLine(this.width, preparedValue);
            this._endDraw();
        });
    }

    /**
     * Подложка для графика
     */
    _drawBackground() {
        this._startDraw();
        this.ctx.fillStyle = this.colors.bg.night;
        this.ctx.fillRect(0, 0, this.width, this.height);
        this._endDraw();
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
        this._startDraw();
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
     * Начало рисования самостоятельной части
     */
    _startDraw() {
        this.ctx.save();
    }

    /**
     * Окончания рисования самостоятельной части
     */
    _endDraw() {
        this.ctx.restore();
    }

    /**
     * Очистка холста
     */
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
}

export default Chart;