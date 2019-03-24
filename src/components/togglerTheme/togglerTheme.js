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

        filterTitle.innerHTML = `Switch theme to ${filter.checked ? 'day' : 'night'}`;

        filterLabel.htmlFor = _id;
        filterLabel.appendChild(filter);
        filterLabel.appendChild(filterTitle);
        filterLabel.classList.add('toggler-theme');

        filterLabel.addEventListener('change', () => {
            if (filter.checked) {
                state.currentTheme = 'night';
                filterTitle.innerHTML = `Switch theme to day`;
            } else {
                state.currentTheme = 'day';
                filterTitle.innerHTML = `Switch theme to night`;
            }
            params.onChange();
        })

        params.container.appendChild(filterLabel);
    }
}

export default TogglerTheme;
