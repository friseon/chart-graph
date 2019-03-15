import {
    prepareData
} from './../../utils';

import {
    MainChart,
    SearchChart,
    LineFilter
} from './../index';

class SearchController {
    constructor(params) {
        this.data = prepareData(params.data);
        this.chartContainer = document.querySelector('.chart');
        this._state = {
            filters: {}
        };

        this.mainChart = new MainChart({
            idCanvas: "main-chart",
            data: this.data,
            chartContainer: this.chartContainer
        });

        this.searchChart = new SearchChart({
            idCanvas: "search-chart",
            data: this.data,
            width: 800,
            height: 100,
            chartContainer: this.chartContainer
        });
    }

    init() {
        this.data.lines.forEach(item => {
            this._updateFilters(item.name, true);

            return new LineFilter({
                name: item.name,
                color: item.color,
                chartContainer: this.chartContainer,
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
        this.searchChart.redraw(filteredData);
    }
}

export default SearchController;
