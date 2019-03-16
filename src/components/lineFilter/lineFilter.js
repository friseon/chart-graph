import './lineFilter.scss';

class LineFilter {
    constructor(params) {
        const filter = document.createElement('input');
        const filterLabel = document.createElement('label');
        const filterId = params.name + 'line';

        filter.type = 'checkbox';
        filter.id = filterId;
        filter.checked = true;

        filterLabel.innerHTML = params.name;
        filterLabel.htmlFor = filterId;
        filterLabel.appendChild(filter);
        filterLabel.classList.add('line-filter');

        filterLabel.addEventListener('click', (e) => {
            params.callback(params.name, e.target.checked);
        })

        params.container.appendChild(filterLabel);
    }
}

export default LineFilter;
