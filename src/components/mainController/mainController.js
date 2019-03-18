import {
    prepareData,
    constants
} from '../../utils';

import {
    MainChart,
    SearchPanel
} from '../index';

import './mainController.scss';

class MainController {
    constructor(params) {
        this.data = prepareData(params.data);
        this.chartContainer = document.querySelector('.chart');

        const mainPanel = document.createElement('div');
        mainPanel.classList.add('main-panel');
        mainPanel.style.width = params.width + 'px';

        mainPanel.addEventListener('pointerdown', this._onStartSearch.bind(this));

        // TODO: привести к номальному виду popup
        this.line = document.createElement('div');
        this.line.classList.add('search-line');

        this.popup = document.createElement('div');
        this.popup.classList.add('popup');

        const popupDate = document.createElement('h3');
        popupDate.classList.add('popup-date');

        const popupInfo = document.createElement('div');
        popupInfo.classList.add('popup-info');

        this.popup.appendChild(popupDate);
        this.popup.appendChild(popupInfo);

        this.popupLineInfo = document.createElement('div');
        this.popupLineInfo.classList.add('popup-line-info');

        const popupLineName = document.createElement('p');
        popupLineName.classList.add('popup-line-name');
        const popupLineValue = document.createElement('p');
        popupLineValue.classList.add('popup-line-value');

        this.popupLineInfo.appendChild(popupLineValue);
        this.popupLineInfo.appendChild(popupLineName);

        this.width = params.width;

        mainPanel.appendChild(this.line);
        mainPanel.appendChild(this.popup);

        this.mainChart = new MainChart({
            idCanvas: "main-chart",
            data: this.data,
            container: mainPanel,
            onUpdateData: this.onUpdateData
        });

        this.chartContainer.appendChild(mainPanel);

        this.searchPanel = new SearchPanel({
            data: this.data,
            container: this.chartContainer,
            width: params.width,
            onUpdate: (data) => {
                this.step = Math.round(this.width / (data.dates.length - 1));
                this._hidePopup();
                this._popupData(data);
                this.mainChart.redraw(data);
            }
        });
    }

    init() {
        this.searchPanel.init();
    }

    _popupData(data) {
        const _items = data.dates.map((date, index) => {
            return {
                date,
                values: [],
                x: this.step * index
            }
        });

        data.lines.forEach(line => {
            const item = this.popupLineInfo.cloneNode(true);
            item.style.color = line.color;
            item.id = line.name;

            this.popup.querySelector('.popup-info').appendChild(item);

            line.data.forEach((value, index) => {
                const _temp = {
                    name: line.name,
                    value: value,
                };

                _items[index].values.push(_temp);
            });
        })

        this.currentData = _items;
    }

    _onStartSearch() {
        this._showPopup();
        const _onMoveLineMethod = (eventMove) => this._onLineMove.call(this, eventMove);

        const _onStopMoveLine = () => {
            document.removeEventListener('pointermove', _onMoveLineMethod);
            document.removeEventListener('pointerup', _onStopMoveLine);
        }

        document.addEventListener('pointermove', _onMoveLineMethod);
        document.addEventListener('pointerup', _onStopMoveLine);
    }

    _onLineMove(e) {
        const delta = this.step / 2;

        const currentValue = this.currentData.find((item) => {
            return item.x === 0 && e.clientX <= delta ||
                item.x > delta && e.clientX > (item.x - delta) && e.clientX < (item.x + delta);
        });

        if (currentValue) {
            const date = new Date(currentValue.date);
            const formattedDate = `${constants.dayNames[date.getDay()]}, ${constants.monthNames[date.getMonth()]} ${date.getDate()}`;
            this.popup.querySelector('.popup-date').textContent = formattedDate;

            currentValue.values.forEach(item => {
                document.getElementById(item.name).querySelector('.popup-line-name').textContent = item.name;
                document.getElementById(item.name).querySelector('.popup-line-value').textContent = item.value;
            })

            this._setLinePosition(currentValue.x);
        }
    }

    _setLinePosition(coords) {
        if (coords + this.popup.offsetWidth >= this.width) {
            this.popup.style.left = coords - this.popup.offsetWidth - 18 + 'px';
        } else {
            this.popup.style.left = coords + 'px';
        }
        this.line.style.left = coords + 'px';
    }

    _hidePopup() {
        this.popup.style.display = 'none';
        this.line.style.display = 'none';
    }

    _showPopup() {
        this.popup.style.display = 'block';
        this.line.style.display = 'block';
    }
}

export default MainController;
