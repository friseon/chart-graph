import Chart from '../chart/chart.js';

import {
    getMinMax
} from './../../utils';

class SearchChart extends Chart {
    updateCurrentData(params) {
        this._isStop = true;
        cancelAnimationFrame(this._reqId);

        const minmax = getMinMax(this.currentChartData, {
            filters: params.filters
        });

        const step = this.width / (this.currentChartState.dates.length - 1);
        const animationSpeed = 20;

        this.currentChartState = {
            ...this.currentChartState,
            updatedFilter: this._getUpdatedFilter(params),
            filters: {...params.filters},
            max: minmax.max,
            min: minmax.min,
            kY: (-this._bottom) / (minmax.max - minmax.min),
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
                        y: isLineHidden ? -Math.round(Math.max(1, currentY / animationSpeed)) : Math.round((newY - currentY) / animationSpeed)
                    },
                    x: point.x || step * index,
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

                if (typeof currentLine.opacity === 'undefined') {
                    currentLine.opacity = 1;
                }

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
                    const currentY = +currentCoords.y.toFixed(1);
                    const newCoords = {
                        ...newLine.coords[index2],
                        y: +newLine.coords[index2].y.toFixed(1)
                    };

                    if (currentY !== newCoords.y) {
                        this._isStop = false;

                        const isNearY = Math.abs(newCoords.y - currentY) <= 15;

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