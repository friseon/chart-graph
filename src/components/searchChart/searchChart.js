import Chart from '../chart/chart.js';

class SearchChart extends Chart {
    _prepareValue(val) {
        return this.height - this.height / this.chartParams.max * val;
    }
}

export default SearchChart;