import './togglerTheme.scss';

import {
    chartColors,
    state
} from '../../config/config';

class TogglerTheme {
    constructor(params) {
        const filter = document.createElement('input');
        const filterLabel = document.createElement('label');
        const filterTitle = document.createElement('span');
        const _id = 'theme' + params.chartId;

        filter.type = 'checkbox';
        filter.id = _id;

        filterTitle.innerHTML = `Switch to ${filter.checked ? 'Day' : 'Night'} Mode`;

        filterLabel.htmlFor = _id;
        filterLabel.appendChild(filter);
        filterLabel.appendChild(filterTitle);
        filterLabel.classList.add('toggler-theme');

        filterLabel.addEventListener('change', () => {
            if (filter.checked) {
                state.currentTheme = 'night';
                filterTitle.innerHTML = `Switch to Day Mode`;
            } else {
                state.currentTheme = 'day';
                filterTitle.innerHTML = `Switch to Night Mode`;
            }
            params.onChange();
        })

        params.container.appendChild(filterLabel);
    }
}

export default TogglerTheme;
