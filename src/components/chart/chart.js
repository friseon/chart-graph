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

        if (params.paddings) {
            this._bottom = this.height - params.paddings.bottom || 0;
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

    updateChart(params) {
        this._isStop = true;
        cancelAnimationFrame(this._reqId);

        this._lastParams = {...params};

        const max = getMax(this.lines);
        const step = this.width / (params.end - params.start);

        this.chartData.max = max;
        this.chartData.step = step;

        this.newLines = this.lines.map(line => {
            const currentLine = {...line};

            currentLine.coords = line.data.map((point, index) => {
                if (index > params.end) {
                    return {
                        x: this.width,
                        y: this._bottom
                    }
                }
                if (index < params.start) {
                    return {
                        x: 0,
                        y: this._bottom
                    }
                }

                if (index === 0 && index === params.start) {
                    return {
                        x: 0,
                        y: this.getYFromPointValue(point)
                    }
                }

                return {
                    x: step * (index - params.start),
                    y: this.getYFromPointValue(point)
                }
            });

            return currentLine;
        });

        this.redraw2(this._lastParams);
    }

    redraw2(params) {
        this._index = this._index + 1;
        this._prepareChartData2(params);
        this.clear();
        this.draw();

        if (!this._isStop) {
            this._reqId = window.requestAnimationFrame(() => this.redraw2(params));
        }
    }

    _prepareChartData2(params) {
        this._isStop = true;

        const lines = this._lines ? this._lines : this.lines;

        this._lines = lines
            .map((line, index) => {
                const currentLine = {...line};
                const newLine = this.newLines[index];
                const newStartCoords = newLine.coords[params.start];
                const newEndCoords = newLine.coords[params.end];

                currentLine.coords = currentLine.coords.map((item, index2) => {
                    const currentCoords = {...item};
                    const newCoords = {
                        ...newLine.coords[index2],
                        x: +newLine.coords[index2].x.toFixed(1),
                        y: +newLine.coords[index2].y.toFixed(1)
                    };
                    const currentY = +currentCoords.y.toFixed(1);
                    const currentX = +currentCoords.x.toFixed(1);

                    if (!params.filters[currentLine.name]) {
                        if (currentY < this._bottom) {
                            this._isStop = false;

                            const deltaY = currentY > 0 ? (this._bottom - currentY) / 10 : this._bottom / 10;

                            currentLine.opacity = (this._bottom - currentY) / this._bottom;

                            return {
                                ...currentCoords,
                                y: Math.abs(deltaY) < .3 && currentY < this._bottom ? this._bottom + 2 : currentY + deltaY
                            }
                        }
                    } else {
                        if (index2 < params.start && currentY !== newStartCoords.y) {
                            this._isStop = false;

                            const deltaY = (newStartCoords.y - currentY) / 10;

                            return {
                                y: Math.abs(deltaY) < .3 ? newStartCoords.y : currentY + deltaY,
                                x: 0
                            };
                        } else if (index2 > params.end && currentY !== newEndCoords.y) {
                            this._isStop = false;

                            let deltaY = (newEndCoords.y - currentY) / 10;

                            return {
                                y: Math.abs(deltaY) < .3 ? newEndCoords.y : currentY + deltaY,
                                x: this.width
                            };
                        } else if (index2 >= params.start && index2 <= params.end &&
                            (currentX !== newCoords.x || currentY !== newCoords.y)) {
                            this._isStop = false;
                            const _dX = newCoords.x - currentX;
                            const _dY = newCoords.y - currentY;

                            let deltaX = currentX !== newCoords.x ? Math.round(_dX / 10) : 0;
                            let deltaY = currentY !== newCoords.y ? Math.round(_dY / 10) : 0;

                            deltaX = _dX > 0 ? Math.max(1, deltaX) : Math.min(-1, deltaX);
                            deltaY = _dY > 0 ? Math.max(1, deltaY) : Math.min(-1, deltaY);

                            if (params.filters[currentLine.name] !== this.newLines[currentLine.name]) {
                                currentLine.opacity = 1 - (Math.abs(_dY) / currentY).toFixed(1);
                            }

                            // console.log(index2, deltaY, '----', currentY, newCoords.y)
    
                            return {
                                y: Math.abs(deltaY) === 1 ? newCoords.y : currentY + deltaY,
                                x: Math.abs(deltaX) === 1 ? newCoords.x : currentX + deltaX
                            };
                        }
                    }

                    return item;
                })

                return currentLine;
            })
        // const max = getMax(data.lines);
        // const step = this.width / (data.dates.length - 1);

        // this.chartData = {
        //     dates: data.dates,
        //     max,
        //     step
        // };
        // this.lines = this._getCoords(data.lines, step);


        // if (!this._isStop && this._index < 500) {
    }

    /**
     * Перевод значения в данных на отображение в графике
     * 
     * @param {Number} val – значение в данных
     */
    getYFromPointValue(val) {
        const p = this.height - this.chartParams.paddings.top - this.chartParams.paddings.bottom;

        return Math.round(this.height - p / this.chartData.max * val - this.chartParams.paddings.bottom);
    }

    /**
     * Отрисовка линий графика
     */
    _drawCharts() {
        const lines = this._lines || this.lines;

        lines.forEach(line => {
            line.coords.forEach((item, index, arr) => {
                if (line.coords[index + 1]) {
                    this._nextPoint = {
                        x: line.coords[index + 1].x,
                        y: line.coords[index + 1].y
                    }
                }

                if (item.x === 0) {
                    this._startLine(item.x, item.y, line.color, 1, line.opacity);
                } else {
                    // this._drawSmoothLine(item.x, item.y, index + 1 === arr.length);
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
    _startLine(startX, startY, color, lineWidth = 1, opacity = 1) {
        this.ctx.lineJoin = this.ctx.lineCap = 'round';
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.globalAlpha = opacity;
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

    _drawSmoothLine2(endX, endY, isLast) {
        var c = (endX + this._nextPoint.x) / 2;
        var d = (endY + this._nextPoint.y) / 2;

        var a = (endX + c) / 2;
        var b = (endY + d) / 2;

        var f = (c + this._nextPoint.x) / 2;
        var e = (d + this._nextPoint.y) / 2;

        if (isLast) {
            c = this._nextPoint.x;
            d = this._nextPoint.y;
        }

        this.ctx.quadraticCurveTo(endX, endY, a, b);
        this.ctx.quadraticCurveTo(a, b, c, d);
        this.ctx.quadraticCurveTo(c, d, f, e);
        this.ctx.stroke();
    }

    _drawSmoothLine(endX, endY, isLast) {
        var a = endX + (this._nextPoint.x - endX) / 3;
        var b = endY + (this._nextPoint.y - endY) / 3;

        var c = endX + (this._nextPoint.x - endX) / 3 * 2;
        var d = endY + (this._nextPoint.y - endY) / 3 * 2;

        if (isLast) {
            c = this._nextPoint.x;
            d = this._nextPoint.y;
        }

        this.ctx.quadraticCurveTo(endX, endY, a, b);
        this.ctx.quadraticCurveTo(a, b, c, d);
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