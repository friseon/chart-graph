import {
    ChartConstructor
} from './components';

import './style.scss';

import prod_data from './data/chart_data.json';
import test_data from './data/data.json';

// prod_data.slice(4,5).forEach(data => {
prod_data.forEach(data => {
// test_data.forEach(data => {
    const chart = new ChartConstructor({
        idCanvas: "main-chart",
        data,
        width: window.innerWidth,
        height: window.screen.height / 2,
        title: 'Followers'
    });

    chart.init();
});
