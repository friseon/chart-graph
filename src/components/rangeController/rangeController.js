class RangeController {
    constructor(params) {
        const rangePanel = document.createElement('div');
        rangePanel.classList.add('range-panel');

        const range = document.createElement('div');
        range.classList.add('range');

        this.currentCoords = {
            start: params.width * .3,
            end: params.width * .6
        };

        this.rangeStart = range.cloneNode(true);
        this.rangeStart.classList.add('range-start');
        this.rangeEnd = range.cloneNode(true);
        this.rangeEnd.classList.add('range-end');
        this._updateChart = params._onUpdate;

        rangePanel.appendChild(this.rangeStart);
        rangePanel.appendChild(this.rangeEnd);

        params.container.appendChild(rangePanel);

        this.container = rangePanel;
    }

    init() {
        const containerParams = this.container.getBoundingClientRect();

        this.limits = {
            left: 0,
            right: containerParams.width
        };


        this._updateCoords(this.currentCoords.start, 'start');
        this._updateCoords(this.currentCoords.end, 'end');

        this.rangeStart.addEventListener('pointerdown', (eventStart) => this._onRangeChange(eventStart, 'start'));
        this.rangeEnd.addEventListener('pointerdown', (eventStart) => this._onRangeChange(eventStart, 'end'));

        this._updateChart(this.currentCoords)
    }

    _onRangeChange(eventStart, type) {
        const move = (eventMove) => this._onRangeMove.call(this, eventMove, type);

        const onRangeUp = () => {
            document.removeEventListener('pointermove', move);
            document.removeEventListener('pointerup', onRangeUp);
            this._updateChart(this.currentCoords)
        }

        document.addEventListener('pointermove', move);
        document.addEventListener('pointerup', onRangeUp);

        this.currentCoords[type] = eventStart.clientX;
    }

    _calculateNewCoords(shift, type) {
        const current = type === 'start' ? this.rangeStart.offsetLeft : this.rangeEnd.offsetLeft
        let newCoords = current - shift;

        if (type === 'start' && newCoords > this.rangeEnd.offsetLeft - 20) {
            newCoords = this.rangeEnd.offsetLeft - 20;
        }
        if (type === 'end' && newCoords < this.rangeStart.offsetLeft + 20) {
            newCoords = this.rangeStart.offsetLeft + 20;
        }

        if (newCoords > this.limits.right) {
            newCoords = this.limits.right;
        }
        if (newCoords < this.limits.left) {
            newCoords = this.limits.left;
        }

        return newCoords;
    }

    _updateCoords(coords, type) {
        if (type === 'start') {
            this.rangeStart.style.left = coords + 'px';
        }
        if (type === 'end') {
            this.rangeEnd.style.left = coords + 'px';
        }
    }

    _onRangeMove(e, type) {
        const coord = this.currentCoords[type];
        const shift = coord - e.clientX;

        const newCoords = this._calculateNewCoords(shift, type);

        this.currentCoords[type] = e.clientX;

        this._updateCoords(newCoords, type);
    }
}

export default RangeController;
