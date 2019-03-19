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
        this.chartParams = {
            paddings: params.paddings
        }

        this._prepareChartData(params.data);
    }

    /**
     * Подготовка данных
     * 
     * @param {Array} data – сырые данные
     */
    _prepareChartData(data) {
        const max = getMax(data.lines);
        const step = this.width / (data.dates.length - 1);

        this.chartData = {
            dates: data.dates,
            max,
            step
        };
        this.lines = this._getCoords(data.lines, step);
    }

    _getCoords(lines, step) {
        return lines.map(line => {
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
    draw() {
        this._drawCharts();
    }

    redraw(data) {
        this._prepareChartData(data);
        this.clear();
        this.draw();
    }

    /**
     * Перевод значения в данных на отображение в графике
     * 
     * @param {Number} val – значение в данных
     */
    getYFromPointValue(val) {
        const p = this.height - this.chartParams.paddings.top - this.chartParams.paddings.bottom;

        return this.height - p / this.chartData.max * val - this.chartParams.paddings.bottom;
    }

    /**
     * Отрисовка линий графика
     */
    _drawCharts() {
        this.lines.forEach(line => {
            line.coords.forEach(item => {
                if (item.x === 0) {
                    this._startLine(item.x, item.y, line.color);
                } else {
                    this._drawLine(item.x, item.y);
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