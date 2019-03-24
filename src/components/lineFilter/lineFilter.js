import './lineFilter.scss';

import {
    chartColors, state
} from '../../config/config';

class LineFilter {
    constructor(params) {
        const filter = document.createElement('input');
        const filterMarker = document.createElement('span');
        const filterTitle = document.createElement('span');
        // TODO: в конфиг, имя/ин графика
        const filterId = params.name + 'line' + Date.now();

        filter.type = 'checkbox';
        filter.id = filterId;
        filter.checked = true;

        filterMarker.classList.add('filter-marker');
        filterMarker.style.backgroundColor = params.color;
        filterMarker.style.borderColor = params.color;
        filterMarker.classList.add('checked');

        filterTitle.classList.add('filter-title');

        filterTitle.innerHTML = params.name;

        this.filterLabel = document.createElement('label');
        this.filterLabel.htmlFor = filterId;
        this.filterLabel.appendChild(filter);
        this.filterLabel.appendChild(filterMarker);
        this.filterLabel.appendChild(filterTitle);
        this.filterLabel.classList.add('line-filter');
        this.filterLabel.style.borderColor = chartColors.line[state.currentTheme];
        this.filterLabel.style.color = chartColors.text2[state.currentTheme];

        this.filterLabel.addEventListener('change', (e) => {
            filterMarker.style.backgroundColor = e.target.checked ? params.color : 'transparent';
            filterMarker.classList.toggle('checked', e.target.checked)
            params.callback(params.name, e.target.checked);
        })

        params.container.appendChild(this.filterLabel);
    }

    updateTheme() {
        this.filterLabel.style.borderColor = chartColors.line[state.currentTheme];
        this.filterLabel.style.color = chartColors.text2[state.currentTheme];
    }
}

export default LineFilter;
