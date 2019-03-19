import {
    ChartConstructor
} from './components';

import prod_data from './data/chart_data.json';
import test_data from './data/data.json';

test_data.forEach(data => {
    const chart = new ChartConstructor({
        idCanvas: "main-chart",
        data,
        width: 800,
        height: 600
    });

    chart.init();
});
