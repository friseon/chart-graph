import {
    getDividers
} from './../../utils';
import Chart from '../chart/chart';

class MainChart extends Chart {
    _prepareChartParams(data) {
        super._prepareChartParams(data);

        this.chartParams.deviders = getDividers(this.chartParams.max);
        this.chartParams.padding = {
            top: 10,
            bottom: 100
        };
    }

    draw() {
        super.draw();

        this._drawDividers();
    }
}

export default MainChart;
