import { Chart } from '../chart/chart.js';

export class SearchChart extends Chart {
    _prepareValue(val) {
        return this.height - this.height / this.chartParams.max * val;
    }
}