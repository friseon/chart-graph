import {
    getMax,
    getMin
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

        this._setOriginalChartData(params.data);

        this._index = 0;
    }

    /**
     * Подготовка данных
     * 
     * @param {Array} data – сырые данные
     */
    _setOriginalChartData(data) {
        const max = getMax(data.lines);
        const step = this.width / (data.dates.length - 1);

        this.originalChartData = {
            dates: data.dates,
            max,
            step
        };
        this.currentChartData = {...this.originalChartData};

        this.lines = this._setCoords(data.lines, step);
    }

    _setCoords(lines, step) {
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

    _getUpdatedFilter(params) {
        let updatedFilter;

        if (!this.currentChartData || !this.currentChartData.filters) {
            return;
        }

        Object.keys(params.filters).forEach(filterName => {
            if (this.currentChartData.filters[filterName] !== params.filters[filterName]) {
                updatedFilter = filterName;
                return
            }
        });;

        return updatedFilter
    }

    updateCurrentCoords(params) {
        this._isStop = true;
        cancelAnimationFrame(this._reqId);

        const max = getMax(this.lines, params);
        const min = getMin(this.lines, params); // доработай минимальное значение
        const step = this.width / (params.end - params.start);
        const dates = this.originalChartData.dates.slice(params.start, params.end + 1);

        this.currentChartData = {
            ...this.originalChartData,
            dates,
            max,
            min,
            step,
            start: params.start,
            end: params.end,
            updatedFilter: this._getUpdatedFilter(params),
            filters: {...params.filters}
        };

        this.goalData = this.lines.map(line => {
            const currentLine = {...line};
            const endPointValue = this.getYFromPointValue(line.data[params.end]);
            const startPointValue = this.getYFromPointValue(line.data[params.start]);

            currentLine.coords = line.data.map((point, index) => {
                if (index > params.end) {
                    return {
                        x: this.width,
                        y: endPointValue
                    }
                }
                if (index < params.start) {
                    return {
                        x: 0,
                        y: startPointValue
                    }
                }

                return {
                    x: step * (index - params.start),
                    y: this.getYFromPointValue(point)
                }
            });

            return currentLine;
        });

        this.currentChartData.cuttedData = this.goalData
            .map(line => {
                return {
                    ...line,
                    coords: line.coords.slice(params.start, params.end + 1),
                    data: line.data.slice(params.start, params.end + 1)
                }
            })
            .filter(line => params.filters[line.name]);

        this.redraw(params);
    }

    redraw(params) {
        this._updateCurrentCoords(params);
        this.clear();
        this.draw();

        if (!this._isStop) {
            this._reqId = window.requestAnimationFrame(() => this.redraw(params));
        }
    }

    _updateCurrentCoords(params) {
        this._isStop = true;

        this.lines = this.lines
            .map((line, index) => {
                const currentLine = {...line};
                const newLine = this.goalData[index];

                if (!params.filters[currentLine.name]) {
                    if (typeof currentLine.opacity === 'undefined' || currentLine.opacity > 1) {
                        currentLine.opacity = .4;
                    }

                    currentLine.opacity = currentLine.opacity > 0 ? +currentLine.opacity.toFixed(2) - .05 : 0;
                } else if (this.currentChartData.updatedFilter === currentLine.name) {
                    if (typeof currentLine.opacity === 'undefined' || currentLine.opacity > 1) {
                        currentLine.opacity = .4;
                    }

                    currentLine.opacity = currentLine.opacity <= 1 ? +currentLine.opacity.toFixed(2) + .05 : 1;
                }


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
                        if (currentY > -10) {
                            this._isStop = false;

                            const deltaY = Math.max(this._bottom / 20, currentY / 10);

                            return {
                                ...currentCoords,
                                y: currentY < -10 ? 0 : currentY - deltaY
                            }
                        }
                    } else if (currentX !== newCoords.x || currentY !== newCoords.y) {
                        this._isStop = false;

                        const deltaX = (newCoords.x - currentX) / 10;
                        const deltaY = (newCoords.y - currentY) / 10;

                        return {
                            y: Math.abs(deltaY) <= 1 ? newCoords.y : currentY + deltaY,
                            x: Math.abs(deltaX) <= 1 ? newCoords.x : currentX + deltaX
                        };
                    }

                    return item;
                })

                return currentLine;
            })

    }

    /**
     * Перевод значения в данных на отображение в графике
     * 
     * @param {Number} val – значение в данных
     */
    getYFromPointValue(val) {
        const p = this.height - this.chartParams.paddings.top - this.chartParams.paddings.bottom;

        return Math.round(this.height - p / this.currentChartData.max * val - this.chartParams.paddings.bottom);
    }

    /**
     * Отрисовка линий графика
     */
    _drawCharts() {
        const lines = this._lines || this.lines;

        lines.forEach(line => {
            this._startOpacity = line.opacity;

            line.coords.forEach((item, index, arr) => {
                if (line.coords[index + 1]) {
                    this._nextPoint = {
                        x: line.coords[index + 1].x,
                        y: line.coords[index + 1].y
                    }
                }

                if (item.x === 0) {
                    this._startLine(item.x, item.y, line.color, item.lineWidth, line.opacity);
                } else {
                    // this._drawSmoothLine(item.x, item.y, index + 1 === arr.length);
                    this._drawLine(item.x, item.y, item.opacity);
                }
            })
        });
        this.ctx.globalAlpha = 1;
    }

    /**
     * Начало линии
     * 
     * @param {Number} startX 
     * @param {Number} startY 
     * @param {String} color 
     * @param {Number} lineWidth 
     */
    _startLine(startX, startY, color, lineWidth = 1, opacity) {
        if (typeof opacity === 'number') {
            this.ctx.globalAlpha = opacity;
        }
        this.ctx.globalAlpha = opacity;
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
    _drawLine(endX, endY, opacity) {
        if (typeof opacity === 'number' && this._startOpacity === 1) {
            this.ctx.globalAlpha = opacity;
        }
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