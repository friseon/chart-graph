import {
    prepareData,
    constants,
    getMax
} from '../../utils';

import {
    MainChart,
    SearchPanel
} from '../index';

import './mainController.scss';

class MainController {
    constructor(params) {
        // TODO: в конфиг всё перенести
        this.colors = {
            main: {
                day: '#f5f5f5',
                night: '#242f3e'
            },
            line: {
                day: '',
                night: '#344658'
            },
            text: {
                day: '',
                night: '#fff'
            }
        };

        // TODO: подумать на эти...
        this._id = Date.now();

        this.mainContainer = document.createElement('div');
        this.mainContainer.classList.add('chart-container');
        this.mainContainer.style.width = params.width + 'px';
        this.mainContainer.style.backgroundColor = this.colors.main.night;
        this.mainContainer.style.color = this.colors.text.night;

        this.mainPanel = document.createElement('div');
        this.mainPanel.classList.add('main-panel');

        this._createPopup();

        this.data = prepareData(params.data);

        this.mainPanel.addEventListener('pointerdown', this._onStartSearch.bind(this));

        this.mainChart = new MainChart({
            idCanvas: 'main-chart',
            data: this.data,
            container: this.mainPanel,
            onUpdateData: this.onUpdateData,
            bgColors: this.colors.main.night,
            lineColor: this.colors.line.night
        });

        // TODO: в конфиг всё перенести
        this.width = this.mainChart.width;
        this.height = this.mainChart.height;

        this.mainContainer.appendChild(this.mainPanel);

        this.searchPanel = new SearchPanel({
            data: this.data,
            container: this.mainContainer,
            width: params.width,
            bgColors: this.colors.main,
            onUpdate: (data) => {
                this.step = this.width / (data.dates.length - 1);
                this.max = getMax(data.lines);
                this._hidePopup();
                this._popupData(data);
                this.mainChart.redraw(data);
            }
        });

        document.querySelector('.chart').appendChild(this.mainContainer);
    }

    init() {
        this.searchPanel.init();
    }

    _popupData(data) {
        // предварительные данные, которые нужны для отображения popup
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
            item.id = line.name + this._id;

            const marker = this.chartMarker.cloneNode(true);
            marker.style.borderColor = line.color;
            marker.id = 'marker-' + line.name + this._id;

            this.mainPanel.appendChild(marker);
            this.popup.querySelector('.popup-info').appendChild(item);

            line.data.forEach((value, index) => {
                const _temp = {
                    name: line.name,
                    value: value,
                    y: this._prepareValue(value)
                };

                _items[index].values.push(_temp);
            });
        })

        this.currentData = _items;
    }

    /**
     * Перевод значения в данных на отображение в графике
     * 
     * @param {Number} val – значение в данных
     */
    _prepareValue(val) {
        // TODO: в общий код
        const p = this.height - this.mainChart.chartParams.padding.top - this.mainChart.chartParams.padding.bottom;

        return this.height - p / this.max * val - this.mainChart.chartParams.padding.bottom;
    }

    _onStartSearch() {
        const _onMoveLineMethod = (eventMove) => this._onLineMove.call(this, eventMove);

        const _onStopMoveLine = (e) => {
            document.removeEventListener('pointermove', _onMoveLineMethod);
            document.removeEventListener('pointerup', _onStopMoveLine);

            this._onLineMove(e)
        }

        document.addEventListener('pointermove', _onMoveLineMethod);
        document.addEventListener('pointerup', _onStopMoveLine);
    }

    _onLineMove(e) {
        const delta = this.step / 2;

        const currentValue = this.currentData.find((item) => {
            return e.clientX > (item.x - delta) && e.clientX <= (item.x + delta);
        });


        if (currentValue) {
            if (this._popupHidden) {
                this._showPopup();
            }

            const date = new Date(currentValue.date);
            const formattedDate = `${constants.dayNames[date.getDay()]}, ${constants.monthNames[date.getMonth()]} ${date.getDate()}`;
            this.popup.querySelector('.popup-date').textContent = formattedDate;

            currentValue.values.forEach(item => {
                this._setMarkerPosition(item.name, currentValue.x, item.y);

                document.getElementById(item.name + this._id).querySelector('.popup-line-name').textContent = item.name;
                document.getElementById(item.name + this._id).querySelector('.popup-line-value').textContent = item.value;
            });

            this._setLinePosition(currentValue.x, e.offsetY);
        }
    }

    _setMarkerPosition(name, x, y) {
        document.getElementById('marker-' + name + this._id).style.left = x + 'px';
        document.getElementById('marker-' + name + this._id).style.top = y + 'px'
    }

    _setLinePosition(x, y) {
        if (x + this.popup.offsetWidth >= this.width) {
            this.popup.style.left = x - this.popup.offsetWidth - 18 + 'px';
        } else {
            this.popup.style.left = x + 'px';
        }

        if (y > this.height) {
            y = this.height;
        }

        if (y < 0) {
            y = 0;
        }

        this.popup.style.top = y + 'px';

        this.line.style.left = x + 'px';
    }

    _createPopup() {
        // TODO: привести к номальному виду popup
        this.line = document.createElement('div');
        this.line.classList.add('search-line');
        this.line.style.backgroundColor = this.colors.line.night;
        // TODO: config
        this.line.style.bottom = 55 + 'px';

        this.popup = document.createElement('div');
        this.popup.classList.add('popup');
        this.popup.style.backgroundColor = this.colors.main.night;

        const popupDate = document.createElement('h3');
        popupDate.classList.add('popup-date');

        this.popupInfo = document.createElement('div');
        this.popupInfo.classList.add('popup-info');

        this.popup.appendChild(popupDate);
        this.popup.appendChild(this.popupInfo);

        this.chartMarker = document.createElement('div');
        this.chartMarker.classList.add('chart-marker');
        this.chartMarker.style.backgroundColor = this.colors.main.night;

        this.popupLineInfo = document.createElement('div');
        this.popupLineInfo.classList.add('popup-line-info');

        const popupLineName = document.createElement('p');
        popupLineName.classList.add('popup-line-name');
        const popupLineValue = document.createElement('p');
        popupLineValue.classList.add('popup-line-value');

        this.popupLineInfo.appendChild(popupLineValue);
        this.popupLineInfo.appendChild(popupLineName);

        this.mainPanel.appendChild(this.line);
        this.mainPanel.appendChild(this.popup);
    }

    _clearPopupInfo() {
        this.popupInfo.innerHTML = '';
    }

    _hidePopup() {
        this._popupHidden = true;
        this._clearPopupInfo();
        this.popup.style.display = 'none';
        this.line.style.display = 'none';
        this.mainPanel.querySelectorAll('.chart-marker').forEach(marker => {
            marker.remove();
        });
    }

    _showPopup() {
        this._popupHidden = false;
        this.popup.style.display = 'block';
        this.line.style.display = 'block';
        this.mainPanel.querySelectorAll('.chart-marker').forEach(marker => {
            marker.style.display = 'block';
        });
    }
}

export default MainController;
