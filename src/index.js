import Chart from './chart.js';
import data from './data/chart_data.json';
import test_data from './data/data.json';

const chart = new Chart({
    idCanvas: "canvas",
    // data: data[4]
    data: test_data[0]
});

chart.draw();
