import {
    ChartConstructor
} from './components';

import './style.scss';

import prod_data from './data/chart_data.json';
import test_data from './data/data.json';

prod_data.forEach(data => {
    const chart = new ChartConstructor({
        idCanvas: "main-chart",
        data,
        width: window.innerWidth / 4 * 3,
        height: Math.min(400, window.innerWidth / 2)
    });

    chart.init();
});
