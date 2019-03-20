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

        this._index = 0;
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
        // this._prepareChartData(data);
        this.clear();
        this.draw();
    }

    redraw2(params, isFromSearch) {
        this._index = this._index + 1;
        if (!this._lastParams) {
            this._lastParams = {...params};
        }
        this._prepareChartData2(params);
        this.clear();
        this.draw();
        if (isFromSearch) {
            this._lastParams = {...params};
        }
    }

    _prepareChartData2(params) {
        // console.log(params)
        this._isStop = true;
        const max = getMax(this.lines);
        const step = this.width / (params.end - params.start);

        this.chartData.max = max;
        this.chartData.step = step;

        this._newCoords = this.lines.map(line => {
            const currentLine = {...line};

            currentLine.coords = line.data.map((point, index) => {
                if (index > params.end) {
                    return {
                        x: this.width + 1,
                        y: 0
                    }
                }
                if (index < params.start) {
                    return {
                        x: 0,
                        y: 0
                    }
                }

                if (index === 0 && index === params.start) {
                    return {
                        x: 0,
                        y: this.getYFromPointValue(point)
                    }
                }

                return {
                    x: step * (index - params.start) + 1,
                    y: this.getYFromPointValue(point)
                }
            });

            return currentLine;
        });

        const lines = this._lines ? this._lines : this.lines;

        this._lines = lines
            .map((line, index) => {
                const currentLine = {...line};

                currentLine.coords = currentLine.coords.map((item, index2) => {
                    const currentItem = {...item};

                    if (!params.filters[currentLine.name]) {
                        if (currentItem.y > -2) {
                            this._isStop = false;

                            const deltaY = currentItem.y / 10;

                            return {
                                ...currentItem,
                                y: Math.abs(deltaY) < .5 ? -2 : currentItem.y - deltaY
                            }
                        }
                    } else {
                        if (index2 < params.start && currentItem.y !== this._newCoords[index].coords[params.start].y) {
                            this._isStop = false;

                            const deltaY = (this._newCoords[index].coords[params.start].y - currentItem.y) / 10;

                            return {
                                ...currentItem,
                                y: Math.abs(deltaY) < 1 ? this._newCoords[index].coords[params.start].y : currentItem.y + deltaY,
                                x: 0
                            };
                        } else if (index2 >= params.end && currentItem.y !== this._newCoords[index].coords[params.end].y) {
                            this._isStop = false;

                            const deltaY = (this._newCoords[index].coords[params.end].y - currentItem.y) / 10;

                            return {
                                ...currentItem,
                                y: Math.abs(deltaY) < 3 ? this._newCoords[index].coords[params.end].y : currentItem.y + deltaY,
                                x: this.width
                            };
                        } else if (index2 >= params.start && index2 <= params.end &&
                            (currentItem.x !== this._newCoords[index].coords[index2].x || currentItem.y !== this._newCoords[index].coords[index2].y)) {
                            this._isStop = false;

                            const deltaX = (this._newCoords[index].coords[index2].x - currentItem.x) / 10;
                            const deltaY = (this._newCoords[index].coords[index2].y - currentItem.y) / 10;
    
                            return {
                                ...currentItem,
                                y: Math.abs(deltaY) < 3 ? this._newCoords[index].coords[index2].y : currentItem.y + deltaY,
                                x: Math.abs(deltaX) < 3 ? this._newCoords[index].coords[index2].x : currentItem.x + deltaX
                            };
                        }
                    }

                    return item;
                })

                return currentLine;
            })

        if (!this._isStop && this._index < 1000) {
            window.requestAnimationFrame(() => this.redraw2(params));
        }
        // const max = getMax(data.lines);
        // const step = this.width / (data.dates.length - 1);

        // this.chartData = {
        //     dates: data.dates,
        //     max,
        //     step
        // };
        // this.lines = this._getCoords(data.lines, step);
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
        const lines = this._lines || this.lines;

        lines.forEach(line => {
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