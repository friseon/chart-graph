import {
    SearchChart,
    LineFilter
} from './../index';

import './searchPanel.scss';

class SearchPanel {
    constructor(params) {
        this._state = {
            filters: {}
        };

        this.data = params.data;
        this.panelContainer = document.createElement('div');
        this.panelContainer.classList.add('search-panel');

        const filterPanel = document.createElement('div');
        filterPanel.classList.add('filter-panel');

        this.searchChart = new SearchChart({
            idCanvas: "search-chart",
            data: this.data,
            width: 800,
            height: 100,
            container: this.panelContainer
        });

        this._onUpdate = params._onUpdate;

        this.data.lines.forEach(item => {
            this._updateFilters(item.name, true);

            new LineFilter({
                name: item.name,
                color: item.color,
                container: filterPanel,
                callback: (name, status) => {
                    this._updateFilters(name, status);
                    this._updateCharts()
                }
            })
        });

        this.panelContainer.appendChild(filterPanel);
        params.container.appendChild(this.panelContainer);
    }

    init() {
        this._updateCharts();
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

        this.searchChart.redraw(filteredData);
        this._onUpdate(filteredData);
    }
}

export default SearchPanel;