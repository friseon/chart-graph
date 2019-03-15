import {
    MainChart,
    SearchChart
} from './components';
import prod_data from './data/chart_data.json';
import test_data from './data/data.json';

const data = test_data[0];

const mainChart = new MainChart({
    idCanvas: "main-chart",
    data
});

const searchChart = new SearchChart({
    idCanvas: "search-chart",
    data,
    width: 800,
    height: 100
});

mainChart.draw();
searchChart.draw();
