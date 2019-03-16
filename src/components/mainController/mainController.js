import {
    prepareData
} from '../../utils';

import {
    MainChart,
    SearchPanel,
    LineFilter
} from '../index';

class MainController {
    constructor(params) {
        this.data = prepareData(params.data);
        this.chartContainer = document.querySelector('.chart');
        this._state = {
            filters: {}
        };

        this.mainChart = new MainChart({
            idCanvas: "main-chart",
            data: this.data,
            container: this.chartContainer
        });

        this.searchPanel = new SearchPanel({
            data: this.data,
            container: this.chartContainer
        });
    }

    init() {
        this.data.lines.forEach(item => {
            this._updateFilters(item.name, true);

            new LineFilter({
                name: item.name,
                color: item.color,
                container: this.chartContainer,
                callback: (name, status) => {
                    this._updateFilters(name, status);
                    this._updateCharts()
                }
            })
        });

        this._updateCharts()
    }

    _updateFilters(name, status) {
        this._state.filters[name] = status;
    }

    _updateCharts() {
        const filteredData = {
            dates: this.data.dates,
            lines: this.data.lines.filter(line => {
                return this._state.filters[line.name];
            })
        };

        this.mainChart.redraw(filteredData);
        this.searchPanel.updateChart(filteredData);
    }
}

export default MainController;
