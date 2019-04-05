import {
    SearchChart,
    LineFilter,
    RangeController
} from './../index';

import {
    throttle
} from './../../utils';

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

        this.step = params.width / (params.data.dates.length - 1);

        this.rangePanel = new RangeController({
            container: this.panelContainer,
            onUpdate: this._calcRange.bind(this),
            width: params.width,
            step: this.step
        });

        const filterPanel = document.createElement('div');
        filterPanel.classList.add('filter-panel');

        this.searchChart = new SearchChart({
            idCanvas: 'search-chart',
            data: this.data,
            width: params.width,
            height: params.rangeHeight,
            container: this.rangePanel.container
        });

        this._onUpdate = throttle(params.onUpdate, 300);

        this.filters = this.data.lines.map(item => {
            this._updateFilters(item.name, true);

            return new LineFilter({
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

    updateTheme() {
        this.filters.forEach(filter => {
            filter.updateTheme();
        });
        this.rangePanel.updateTheme()
    }

    /**
     * Задаёт диапазон периода для графика
     * 
     * @param {*} range 
     */
    _calcRange(range, isFirst) {
        const length = this.data.dates.length - 1;
        const prop = length / this.width;

        this.startIndex = Math.round(prop * range.start);
        this.endIndex = Math.round(prop * range.end) + 1;

        this._updateMainChart(isFirst);
    }

    /**
     * Обновление состояние фильтров (отображение линий графика)
     * 
     * @param {String} name 
     * @param {Boolean} status 
     */
    _updateFilters(name, status) {
        this._state.filters[name] = status;
    }

    /**
     * Фильтруем данные для графика
     */
    _getFilteredData() {
        return {
            filters: this._state.filters,
            start: this.startIndex,
            end: this.endIndex - 1
        };
    }

    _updateSearchChart() {
        this.searchChart.updateCurrentData(this._getFilteredData());
    }

    _updateMainChart(isTrue) {
        this._onUpdate(this._getFilteredData(), isTrue);
    }
}

export default SearchPanel;