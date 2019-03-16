import {
    SearchChart
} from './../index';

class SearchPanel {
    constructor(params) {
        this.data = params.data;
        this.panelContainer = document.createElement('div');
        this.searchChart = new SearchChart({
            idCanvas: "search-chart",
            data: this.data,
            width: 800,
            height: 100,
            container: this.panelContainer
        });

        params.container.appendChild(this.panelContainer);
    }

    updateChart(data) {
        this.searchChart.redraw(data);
    }
}

export default SearchPanel;