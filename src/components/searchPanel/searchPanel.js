import {
    SearchChart,
    LineFilter,
    RangeController
} from './../index';

import './searchPanel.scss';

class SearchPanel {
    constructor(params) {
        this._state = {
            filters: {}
        };

        this.data = params.data;
        this.width = params.width;
        this.panelContainer = document.createElement('div');
        this.panelContainer.classList.add('search-panel');
        this.panelContainer.style.width = params.width + 'px';

        this.rangePanel = new RangeController({
            container: this.panelContainer,
            _onUpdate: this._calcRange.bind(this),
            width: params.width,
            step: params.width / (params.data.dates.length - 1)
        });

        const filterPanel = document.createElement('div');
        filterPanel.classList.add('filter-panel');

        this.searchChart = new SearchChart({
            idCanvas: 'search-chart',
            data: this.data,
            width: params.width,
            height: 100,
            container: this.rangePanel.container
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
                    this._updateMainChart();
                    this._updateSearchChart();
                }
            })
        });

        this.panelContainer.appendChild(this.rangePanel.container);
        this.panelContainer.appendChild(filterPanel);

        params.container.appendChild(this.panelContainer);
    }

    init() {
        this._updateSearchChart();
        this.rangePanel.init();
    }

    _calcRange(range) { 
        const length = this.data.dates.length + 1;
        this.startIndex = Math.ceil(length / this.width * range.start);
        this.endIndex = Math.floor(length / this.width * range.end);
        this._updateMainChart();
    }

    _updateFilters(name, status) {
        this._state.filters[name] = status;
    }

    _getFilteredData(type) {
        let dates = this.data.dates;
        let start = this.startIndex - 1;
        if (Number(start) <= 0) {
            start = 0;
        }

        if (type === 'main') {
            dates = dates.slice(start, this.endIndex);
        }

        const filteredData = {
            dates,
            lines: this.data.lines
                .filter(line => {
                    return this._state.filters[line.name];
                })
                .map(line => {
                    if (type === 'search') {
                        return line;
                    }

                    const filtered = {...line};
                    filtered.data = filtered.data.slice(start, this.endIndex);

                    return filtered;
                })
        };

        return filteredData;
    }

    _updateSearchChart() {
        this.searchChart.redraw(this._getFilteredData('search'));
    }

    _updateMainChart() {
        this._onUpdate(this._getFilteredData('main'));
    }
}

export default SearchPanel;