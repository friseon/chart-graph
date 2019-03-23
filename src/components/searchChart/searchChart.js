import Chart from '../chart/chart.js';

import {
    getMax,
    getMin
} from './../../utils';

class SearchChart extends Chart {
    getYFromPointValue(val) {
        return this.height - this.height / this.currentChartState.max * val;
    }

    _updateCurrentData(params) {
        this._isStop = true;
        cancelAnimationFrame(this._reqId);

        const max = getMax(this.currentChartData, {
            filters: params.filters
        });
        const min = getMin(this.currentChartData, {
            filters: params.filters
        });
        const step = this.width / (this.currentChartState.dates.length - 1);
        const animationSpeed = 20;

        this.currentChartState = {
            ...this.currentChartState,
            updatedFilter: this._getUpdatedFilter(params),
            filters: {...params.filters},
            max,
            min,
            step
        }

        this.goalData = this.currentChartData.map(line => {
            const currentLine = {...line};
            const isLineHidden = !params.filters[currentLine.name];

            currentLine.coords = line.data.map((point, index) => {
                const currentCoords = {...currentLine.coords[index]};
                const newY = this.getYFromPointValue(point);
                const currentY = currentCoords.y;

                return {
                    ...point,
                    steps: {
                        y: isLineHidden ? -Math.round((currentY) / animationSpeed) : Math.round((newY - currentY) / animationSpeed)
                    },
                    x: Math.round(step * index),
                    y: isLineHidden ? (currentY / 2) : newY
                }
            });

            return currentLine;
        });

        this.redraw(params);
    }

    _updatingChart(params) {
        this._isStop = true;

        this.currentChartData = this.currentChartData
            .map((line, index) => {
                const currentLine = {...line};
                const newLine = this.goalData[index];

                if (!params.filters[currentLine.name]) {
                    if (typeof currentLine.opacity === 'undefined' || currentLine.opacity > 1) {
                        currentLine.opacity = .4;
                    }

                    currentLine.opacity = currentLine.opacity > 0 ? +currentLine.opacity.toFixed(2) - .05 : 0;
                } else if (this.currentChartState.updatedFilter === currentLine.name) {
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

                    if (currentY !== newCoords.y) {
                        this._isStop = false;

                        const isNearY = Math.abs(newCoords.y - currentY) <= 5;

                        return {
                            ...newLine.coords[index2],
                            y: isNearY ? newCoords.y : currentY + newCoords.steps.y
                        };
                    }

                    return item;
                });

                return currentLine;
            });
    }
}

export default SearchChart;