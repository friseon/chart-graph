import Chart from '../chart/chart.js';

class SearchChart extends Chart {
    prepareValue(val) {
        return this.height - this.height / this.chartData.max * val;
    }
}

export default SearchChart;