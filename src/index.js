import {
    ChartConstructor
} from './components';

import './style.scss';

import prod_data from './data/chart_data.json';

prod_data.slice().forEach(data => {
    const chart = new ChartConstructor({
        idCanvas: "main-chart",
        data,
        width: window.innerWidth,
        height: window.screen.height / 2,
        title: 'Followers'
    });

    chart.init();
});
