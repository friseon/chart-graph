import {
    getDividers,
    getMinMax
} from './../../utils';

import {
    state,
    chartColors
} from './../../config/config';

import Chart from '../chart/chart';

class MainChart extends Chart {
    _updatingChart(params) {
        this._isStop = true;

        this.currentChartData = this.currentChartData
            .map((line, index) => {
                const currentLine = {...line};
                const newLineCoords = this.goalData[index].coords;

                if (!params.filters[currentLine.name] && currentLine.opacity > 0) {
                    this._isStop = false;

                    currentLine.opacity = currentLine.opacity - .1;
                } else if (params.filters[currentLine.name] &&
                    this.currentChartState.updatedFilter === currentLine.name &&
                    currentLine.opacity < 1) {
                    this._isStop = false;

                    currentLine.opacity = currentLine.opacity + .1;
                }

                currentLine.coords = currentLine.coords.map((item, index2) => {
                    const currentCoords = {...item};
                    const newCoords = {
                        ...newLineCoords[index2],
                        x: newLineCoords[index2].x,
                        y: newLineCoords[index2].y
                    };
                    const currentY = currentCoords.y;
                    const currentX = currentCoords.x;

                    if (currentX !== newCoords.x || currentY !== newCoords.y) {
                        this._isStop = false;

                        const isNearX = Math.abs(newCoords.x - currentX) <= 15;
                        const isNearY = Math.abs(newCoords.y - currentY) <= 15;

                        return {
                            ...newLineCoords[index2],
                            y: isNearY ? newCoords.y : currentY + newCoords.steps.y,
                            x: isNearX ? newCoords.x : currentX + newCoords.steps.x
                        };
                    }

                    return item;
                })

                return currentLine;
            })
    }

    /**
     * Обновление данных для графика
     * 
     * @param {Object} params 
     * @param {Boolean} isFirst – отображение при загрузке
     */
    updateCurrentData(params, isFirst) {
        this._isStop = true;
        cancelAnimationFrame(this._reqId);

        const step = this.width / (params.end - params.start);
        // при первом перестроении (загрузке) отображаем графики сразу, без анимации
        const animationSpeed = isFirst ? 1 : 10;
        const minmax = getMinMax(this.currentChartData, params);

        this.currentChartState = {
            ...this.originalChartState,
            dates: this.originalChartState.dates.slice(params.start, params.end + 1),
            max: minmax.max,
            min: minmax.min,
            kY: (this.chartParams.paddings.top - this._bottom) / (minmax.max - minmax.min),
            step,
            start: params.start,
            end: params.end,
            updatedFilter: this._getUpdatedFilter(params),
            filters: {...params.filters}
        };

        this.goalData = this.currentChartData.map(line => {
            const currentLine = {...line};
            const isLineHidden = !params.filters[currentLine.name];

            currentLine.coords = line.data.map((point, index) => {
                const currentCoords = {...currentLine.coords[index]};
                const currentX = currentCoords.x;
                const currentY = currentCoords.y;
                const newY = this.getYFromPointValue(point);

                return {
                    steps: {
                        x: (step * (index - params.start) - currentX) / animationSpeed,
                        y: isLineHidden ? -Math.round(Math.max(1, currentY / animationSpeed)) : Math.round((newY - currentY) / animationSpeed)
                    },
                    x: step * (index - params.start),
                    y: isLineHidden ? (currentY / 2) : newY
                }
            });

            return currentLine;
        });

        this._updateDateDividers();
        this.currentChartState.dividers = getDividers(minmax.max, minmax.min);

        this.currentChartState.cuttedData = this.goalData
            .reduce((arr, line) => {
                if (params.filters[line.name]) {
                    arr.push({
                        ...line,
                        coords: line.coords.slice(params.start, params.end + 1),
                        data: line.data.slice(params.start, params.end + 1)
                    })
                }
                return arr;
            }, []);

        this.redraw(params);
    }

    _updateDateDividers() {
        this._dateDividers = [];
        const _currentDates = this.currentChartState.dates;
        const _datesLength = _currentDates.length - 1;
        const minWidthDate = 60; // минимальная шрина для даты
        this._dateDividersAmount = _datesLength;
        this._dateStep = this.currentChartState.step;

        if (this.currentChartState.step < minWidthDate) {
            this._dateDividersAmount = Math.round(this.width / minWidthDate);
        }

        const step = Math.ceil(_datesLength / this._dateDividersAmount);

        // выдёргиваем даты, которые будем отображать
        for (let i = 0; i <= this. _dateDividersAmount; i++) {
            const dateIndex = step * i;

            if (_currentDates[dateIndex]) {
                this._dateDividers.push(_currentDates[dateIndex]);
            }
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
        const step = this.width / (this._dateDividers.length - 1);

        this._dateDividers.forEach((divider, index) => {
            const date = divider.short;
            let x = index * step;
            const y = this.height;

            this.ctx.textAlign = 'center';

            // смещаем текст у крайних точек
            if (index === 0) {
                x += 5;
                this.ctx.textAlign = 'start';
            } else if (index === this._dateDividers.length - 1) {
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
