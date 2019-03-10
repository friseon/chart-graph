export default class Chart {
    constructor(params) {
        const canvas = document.getElementById(params.idCanvas);
        this.width = canvas.width = params.width || 800;
        this.height = canvas.height = params.height || 600;

        this.ctx = canvas.getContext("2d");

        this.colors = {
            bg: {
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
        const maxs = [];
        const mins = [];
        const deviders = [];
        const devidersAmount = 6;

        const dates = data.columns.find(column => data.types[column[0]] === "x").slice(1);
        const lines = data.columns.filter(column => data.types[column[0]] === "line");
        const preparedData = lines.map(line => {
            const tag = line.shift();

            return {
                name: data.names[tag],
                color: data.colors[tag],
                data: line
            }
        });

        preparedData.forEach(item => {
            maxs.push(Math.max.apply(null, item.data));
            mins.push(Math.min.apply(null, item.data));
        });
        const min = Math.min.apply(null, mins);
        const max = Math.max.apply(null, maxs);

        for (let i = 0; i < devidersAmount; i++) {
            deviders.push(Math.floor(max / devidersAmount * i));
        }

        this.lines = preparedData;

        this.chartParams = {
            deviders: deviders.sort((a, b) => (a - b)),
            dates,
            min,
            max,
            step: this.width / dates.length
        };
    }

    /**
     * Отрисовка графика
     */
    draw() {
        this._drawBackground();
        this._drawCharts();
        this._drawDividers();
    }

    _prepareValue(val) {
        return this.height - this.height / this.chartParams.max * val;
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

    _drawDividers() {
        this.chartParams.deviders.forEach(devider => {
            const preparedValue = this._prepareValue(devider);

            this._startLine(0, preparedValue, "#f5f5f5", 0.5);
            this.ctx.font = "12px Arial";
            this.ctx.fillStyle = "#f5f5f5";
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

    _startLine(startX, startY, color, lineWidth = 1) {
        this._startDraw();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
    }

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
};
