import './lineFilter.scss';

class LineFilter {
    constructor(params) {
        const filter = document.createElement('input');
        const filterLabel = document.createElement('label');
        const filterMarker = document.createElement('span');
        const filterTitle = document.createElement('span');
        const filterId = params.name + 'line';

        filter.type = 'checkbox';
        filter.id = filterId;
        filter.checked = true;

        filterMarker.classList.add('filter-marker');
        filterMarker.style.backgroundColor = params.color;
        filterMarker.style.borderColor = params.color;

        filterTitle.classList.add('filter-title');

        filterTitle.innerHTML = params.name;

        filterLabel.htmlFor = filterId;
        filterLabel.appendChild(filter);
        filterLabel.appendChild(filterMarker);
        filterLabel.appendChild(filterTitle);
        filterLabel.classList.add('line-filter');

        filterLabel.addEventListener('change', (e) => {
            filterMarker.style.backgroundColor = e.target.checked ? params.color : 'transparent';
            params.callback(params.name, e.target.checked);
        })

        params.container.appendChild(filterLabel);
    }
}

export default LineFilter;
