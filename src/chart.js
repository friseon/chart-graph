import {
    getMax,
    getDates,
    getDividers,
    prepareData
} from './utils';

export default class Chart {
    constructor(params) {
        const chartContainer = document.querySelector('.chart');
        const canvas = document.createElement('canvas');
        canvas.id = params.idCanvas;

        const canvasSearch = document.createElement('canvas');
        canvasSearch.id = "canvas-search";

        chartContainer.appendChild(canvas);
        chartContainer.appendChild(canvasSearch);

        this.width = canvas.width = params.width || 800;
        this.height = canvas.height = params.height || 600;

        this.searchWidth = canvasSearch.width = canvas.width;
        this.searchHeight = canvasSearch.height = 100;

        this.ctx = canvas.getContext("2d");
        this.ctxSearch = canvasSearch.getContext("2d");

        this.colors = {
            bg: {
                day: '#f5f5f5',
                night: '#333'
            }
        };

        this._prepareChartParams(params.data);
    }

    init() {

    }

    /**
     * Подготовка данных
     * 
     * @param {Array} data – сырые данные
     */
    _prepareChartParams(data) {
        const dates = getDates(data);
        const preparedData = prepareData(data);
        const max = getMax(preparedData);
        const deviders = getDividers(max);

        this.lines = preparedData;
        this.chartParams = {
            padding: {
                top: 10,
                bottom: 100
            },
            deviders,
            dates,
            max,
            step: this.width / dates.length
        };
    }

    /**
     * Отрисовка графика
     */
    draw() {
        this._drawBackground(this.ctx);
        this._drawCharts();
        this._drawDividers();
        this._drawSearch();
    }

    /**
     * Перевод значения в данных на отображение в графике
     * 
     * @param {Number} val – значение в данных
     */
    _prepareValue(val, height) {
        const p = height - this.chartParams.padding.top - this.chartParams.padding.bottom;

        return height - p / this.chartParams.max * val - this.chartParams.padding.bottom;
    }

    _prepareSearchValue(val, height) {
        return height - height / this.chartParams.max * val;
    }

    _drawSearch() {
        this._drawBackground(this.ctxSearch);

        this.lines.forEach(line => {
            line.data.forEach((y, index, arr) => {
                const preparedValue = this._prepareSearchValue(y, this.searchHeight);

                if (index === 0) {
                    this._startLine(this.ctxSearch, 0, preparedValue, line.color);
                } else {
                    this._drawLine(this.ctxSearch, this.chartParams.step * index, preparedValue);

                    if (index === arr.length - 1) {
                        this._endDraw(this.ctxSearch);
                    }
                }
            })
        });
    }

    /**
     * Отрисовка линий графика
     */
    _drawCharts() {
        this.lines.forEach(line => {
            line.data.forEach((y, index, arr) => {
                const preparedValue = this._prepareValue(y, this.height);

                if (index === 0) {
                    this._startLine(this.ctx, 0, preparedValue, line.color);
                } else {
                    this._drawLine(this.ctx, this.chartParams.step * index, preparedValue);

                    if (index === arr.length - 1) {
                        this._endDraw(this.ctx);
                    }
                }
            })
        });
    }

    _drawDividers() {
        this.chartParams.deviders.forEach(devider => {
            const preparedValue = this._prepareValue(devider, this.height);

            this._startLine(this.ctx, 0, preparedValue, "#f5f5f5", 0.5);
            this.ctx.font = "12px Arial";
            this.ctx.fillStyle = "#f5f5f5";
            this.ctx.fillText(devider, 5, preparedValue - 5);
            this._drawLine(this.ctx, this.width, preparedValue);
            this._endDraw(this.ctx);
        });
    }

    /**
     * Подложка для графика
     */
    _drawBackground(ctx) {
        this._startDraw(ctx);
        ctx.fillStyle = this.colors.bg.night;
        ctx.fillRect(0, 0, this.width, this.height);
        this._endDraw(ctx);
    }

    _startLine(ctx, startX, startY, color, lineWidth = 1) {
        this._startDraw(ctx);
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
    }

    _drawLine(ctx, endX, endY) {
        ctx.lineTo(endX, endY);
        ctx.stroke();
    }

    /**
     * Начало рисования самостоятельной части
     */
    _startDraw(ctx) {
        ctx.save();
    }

    /**
     * Окончания рисования самостоятельной части
     */
    _endDraw(ctx) {
        ctx.restore();
    }
};
