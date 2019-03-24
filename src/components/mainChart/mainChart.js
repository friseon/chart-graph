import {
    getDividers,
    getMax,
    getMin
} from './../../utils';

import {
    state,
    chartColors
} from './../../config/config';

import Chart from '../chart/chart';

class MainChart extends Chart {
    /**
     * Перевод значения в данных на отображение в графике
     * 
     * @param {Number} val – значение в данных
     */
    getYFromPointValue(val) {
        const bottom = this.height - this.chartParams.paddings.bottom;
        const k = (this.chartParams.paddings.top - bottom) / (this.currentChartState.max - this.currentChartState.min);
        const result = bottom + (val - this.currentChartState.min) * k;

        return Math.round(result);
    }

    _updatingChart(params) {
        this._isStop = true;

        this.currentChartData = this.currentChartData
            .map((line, index) => {
                const currentLine = {...line};
                const newLine = this.goalData[index];

                if (typeof currentLine.opacity === 'undefined') {
                    currentLine.opacity = 1;
                }

                if (!params.filters[currentLine.name] && currentLine.opacity > 0) {
                    this._isStop = false;

                    currentLine.opacity = +(currentLine.opacity - .1).toFixed(2);
                } else if (params.filters[currentLine.name] &&
                    this.currentChartState.updatedFilter === currentLine.name &&
                    currentLine.opacity < 1) {
                    this._isStop = false;

                    currentLine.opacity = +(currentLine.opacity + .1).toFixed(2);
                }

                currentLine.coords = currentLine.coords.map((item, index2) => {
                    const currentCoords = {...item};
                    const newCoords = {
                        ...newLine.coords[index2],
                        x: newLine.coords[index2].x,
                        y: newLine.coords[index2].y
                    };
                    const currentY = currentCoords.y;
                    const currentX = currentCoords.x;

                    if (currentX !== newCoords.x || currentY !== newCoords.y) {
                        this._isStop = false;

                        const isNearX = Math.abs(newCoords.x - currentX) <= 15;
                        const isNearY = Math.abs(newCoords.y - currentY) <= 15;

                        return {
                            ...newLine.coords[index2],
                            y: isNearY ? newCoords.y : currentY + newCoords.steps.y,
                            x: isNearX ? newCoords.x : currentX + newCoords.steps.x
                        };
                    }

                    return item;
                })

                return currentLine;
            })
    }

    _updateCurrentData(params) {
        this._isStop = true;
        cancelAnimationFrame(this._reqId);

        const max = getMax(this.currentChartData, params);
        const min = getMin(this.currentChartData, params);
        const step = this.width / (params.end - params.start);
        const dates = this.originalChartState.dates.slice(params.start, params.end + 1);
        const animationSpeed = 20;

        this.currentChartState = {
            ...this.originalChartState,
            dates,
            max,
            min,
            step,
            start: params.start,
            end: params.end,
            updatedFilter: this._getUpdatedFilter(params),
            filters: {...params.filters}
        };

        this.goalData = this.currentChartData.map(line => {
            const currentLine = {...line};
            const endPointValue = this.getYFromPointValue(line.data[params.end]);
            const startPointValue = this.getYFromPointValue(line.data[params.start]);
            const isLineHidden = !params.filters[currentLine.name];

            currentLine.coords = line.data.map((point, index) => {
                const currentCoords = {...currentLine.coords[index]};
                const newY = this.getYFromPointValue(point);
                const currentX = currentCoords.x;
                const currentY = currentCoords.y;

                if (!isLineHidden && index > params.end) {
                    return {
                        steps: {
                            x: Math.round((this.width - currentX) / animationSpeed),
                            y: Math.round((endPointValue - currentY) / animationSpeed)
                        },
                        x: this.width,
                        y: endPointValue
                    }
                }

                if (!isLineHidden && index < params.start) {
                    return {
                        steps: {
                            x: -Math.round(currentX / animationSpeed),
                            y: Math.round((startPointValue - currentY) / animationSpeed)
                        },
                        x: 0,
                        y: startPointValue
                    }
                }

                return {
                    steps: {
                        x: Math.round((step * (index - params.start) - currentX) / animationSpeed),
                        y: isLineHidden ? -Math.round(Math.max(1, currentY / animationSpeed)) : Math.round((newY - currentY) / animationSpeed)
                    },
                    x: Math.round(step * (index - params.start)),
                    y: isLineHidden ? (currentY / 2) : newY
                }
            });

            return currentLine;
        });

        this._updateDateDividers();
        this.currentChartState.dividers = getDividers(this.currentChartState.max, this.currentChartState.min);

        this.currentChartState.cuttedData = this.goalData
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

    _updateDateDividers() {
        this._dateDividers = [];
        const _currentDates = this.currentChartState.dates;
        const _datesLength = _currentDates.length - 1;
        const minWidthDate = 60; // минимальная шрина для даты
        const _maxDatesAmount = 6;
        this._dateDividersAmount = _datesLength;
        this._dateStep = this.currentChartState.step;

        // ограничение по кол-ву отображаемых дат
        if (_datesLength > _maxDatesAmount) {
            this._dateDividersAmount = _maxDatesAmount;
            this._dateStep = this.width / (_maxDatesAmount - 1);
        }

        if (this._dateStep < minWidthDate) {
            this._dateDividersAmount = Math.floor(this.width / minWidthDate);
            this._dateStep = this.width / (this._dateDividersAmount - 1);
        }

        // выдёргиваем даты, которые будем отображать
        for (let i = 0; i < this. _dateDividersAmount; i++) {
            const dateIndex = Math.round(_datesLength / (this._dateDividersAmount - 1)) * i;

            
            if (i === this._dateDividersAmount - 1) {
                dateIndex= _datesLength;
            }

            this._dateDividers.push(_currentDates[dateIndex]);
        }
    }

    _draw() {
        super._draw();

        this._drawDates();
        this._drawDividers();
    }

    /**
     * Рисование горизонтальных разделителей
     */
    _drawDates() {
        this._dateDividers.forEach((divider, index) => {
            const date = divider.short;
            let x = index * this._dateStep;
            const y = this.height;

            this.ctx.textAlign = 'center';

            // смещаем текст у крайних точек
            if (index === 0) {
                x += 5;
                this.ctx.textAlign = 'start';
            } else if (index === this._dateDividersAmount - 1) {
                x -= 5;
                this.ctx.textAlign = 'end';
            }

            this.ctx.font = '12px Arial';
            this.ctx.fillStyle = chartColors.text[state.currentTheme];
            this.ctx.fillText(date,
                x,
                y - this.chartParams.paddings.bottom + 20);

            this.ctx.textAlign = 'start';
        });
    }

    /**
     * Рисование горизонтальных разделителей
     */
    _drawDividers() {
        this.currentChartState.dividers.forEach(divider => {
            const preparedValue = this.getYFromPointValue(divider);

            this._startLine(0, preparedValue, chartColors.line[state.currentTheme]);
            this.ctx.font = '12px Arial';
            this.ctx.fillStyle = chartColors.text[state.currentTheme];
            this.ctx.fillText(divider, 5, preparedValue - 5);
            this.ctx.lineTo(this.width, preparedValue);
            this.ctx.stroke();
        });
    }
}

export default MainChart;
