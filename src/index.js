import {
    SearchController
} from './components';

import prod_data from './data/chart_data.json';
import test_data from './data/data.json';

const data = test_data[0];
// const data = prod_data[4];

const searchController = new SearchController({
    idCanvas: "main-chart",
    data
});

searchController.init();
