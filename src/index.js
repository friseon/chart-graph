import {
    ChartConstructor
} from './components';

import './style.scss';

import prod_data from './data/chart_data.json';
import test_data from './data/data.json';

prod_data.slice(4,5).forEach(data => {
    const chart = new ChartConstructor({
        idCanvas: "main-chart",
        data,
        width: window.innerWidth / 5 * 4,
        height: window.screen.height / 2
    });

    chart.init();
});
