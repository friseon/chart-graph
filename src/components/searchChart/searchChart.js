import Chart from '../chart/chart.js';

import {
    getMax,
    getMin
} from './../../utils';

class SearchChart extends Chart {
    _setcurrentChartData(data) {
        super._setcurrentChartData(data);

        this._originalData = [...this.lines];
    }

    getYFromPointValue(val) {
        return this.height - this.height / this.currentChartData.max * val;
    }

    updateCurrentCoords(params) {
        this._isStop = true;
        cancelAnimationFrame(this._reqId);

        const max = getMax(this.lines, {
            filters: params.filters
        });
        const min = getMin(this.lines, {
            filters: params.filters
        });
        const step = this.width;

        this.currentChartData = {
            ...this.currentChartData,
            updatedFilter: this._getUpdatedFilter(params),
            filters: {...params.filters},
            max,
            min,
            step
        }

        this.goalData = this.lines.map(line => {
            const currentLine = {...line};

            currentLine.coords = line.data.map((point) => {
                return {
                    ...point,
                    y: this.getYFromPointValue(point)
                }
            });

            return currentLine;
        });

        this.redraw(params);
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
                    const currentY = +currentCoords.y.toFixed(1);
                    const newCoords = {
                        ...newLine.coords[index2],
                        y: +newLine.coords[index2].y.toFixed(1)
                    };

                    if (!params.filters[currentLine.name]) {
                        if (currentY > -10) {
                            this._isStop = false;

                            const deltaY = this.height / 10;

                            return {
                                ...currentCoords,
                                y: currentY < -10 ? -10 : currentY - deltaY
                            }
                        }
                    } else if (currentY !== newCoords.y) {
                        this._isStop = false;

                        const _dY = newCoords.y - currentY;

                        const deltaY = currentY !== newCoords.y ? _dY / 10 : 0;

                        return {
                            ...currentCoords,
                            y: Math.abs(deltaY) <= 1 ? newCoords.y : currentY + deltaY
                        };
                    }

                    return item;
                });

                return currentLine;
            });
    }
}

export default SearchChart;