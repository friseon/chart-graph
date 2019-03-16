import {
    prepareData
} from '../../utils';

import {
    MainChart,
    SearchPanel
} from '../index';

class MainController {
    constructor(params) {
        this.data = prepareData(params.data);
        this.chartContainer = document.querySelector('.chart');
        this.mainChart = new MainChart({
            idCanvas: "main-chart",
            data: this.data,
            container: this.chartContainer
        });

        this.searchPanel = new SearchPanel({
            data: this.data,
            container: this.chartContainer,
            _onUpdate: (data) => {
                this.mainChart.redraw(data);
            }
        });
    }

    init() {
        this.searchPanel.init();
        // this.mainChart.draw()
    }
}

export default MainController;
