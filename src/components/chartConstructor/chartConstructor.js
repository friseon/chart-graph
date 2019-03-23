import {
    prepareData
} from '../../utils';

import {
    MainChart,
    SearchPanel
} from '../index';

import {
    chartColors
} from '../../config/config';

import './chartConstructor.scss';

class ChartConstructor {
    constructor(params) {
        this._chartId = Date.now();

        this.container = document.createElement('div');
        this.container.classList.add('chart-container');
        this.container.style.width = params.width + 'px';
        this.container.style.backgroundColor = chartColors.main.night;
        this.container.style.color = chartColors.text.night;

        this.detailsPanel = document.createElement('div');
        this.detailsPanel.classList.add('details-panel');

        this._createPopup();

        this.data = prepareData(params.data);

        this.detailsPanel.addEventListener('pointerdown', this._onStartSearch.bind(this));

        this.mainChart = new MainChart({
            idCanvas: 'main-chart',
            data: this.data,
            container: this.detailsPanel,
            onUpdateData: this.onUpdateData,
            lineColor: chartColors.line.night,
            width: params.width,
            height: params.height,
            paddings: {
                top: 10,
                bottom: 50
            }
        });

        // TODO: в конфиг всё перенести
        this.width = params.width;
        this.height = params.height;

        this.container.appendChild(this.detailsPanel);

        this.searchPanel = new SearchPanel({
            data: this.data,
            container: this.container,
            width: params.width,
            rangeHeight: Math.max(params.height / 4, 100),
            onUpdate: (params) => {
                this._hidePopup();
                this.mainChart._updateCurrentData(params, true);
                this._prepareDetaisData({
                    dates: this.mainChart.currentChartState.dates,
                    lines: this.mainChart.currentChartState.cuttedData
                });
            }
        });

        document.querySelector('.chart').appendChild(this.container);
    }

    init() {
        this.searchPanel.init();
    }

    _prepareDetaisData(data) {
        // предварительные данные, которые нужны для отображения popup
        const _items = data.dates.map(date => {
            return {
                date,
                values: []
            }
        });

        data.lines.forEach(line => {
            const item = this.popupLineDetails.cloneNode(true);
            item.style.color = line.color;
            item.id = line.name + this._chartId;

            const pointMarker = this.pointMarker.cloneNode(true);
            pointMarker.style.borderColor = line.color;
            pointMarker.id = 'point-marker-' + line.name + this._chartId;

            this.detailsPanel.appendChild(pointMarker);
            this.detailsPopup.querySelector('.details-popup__info').appendChild(item);

            line.data.forEach((value, index) => {
                const _temp = {
                    name: line.name,
                    value: value,
                    y: line.coords[index].y
                };

                _items[index].x = line.coords[index].x;
                _items[index].values.push(_temp);
            });
        });

        this.currentData = _items;
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
        const delta = this.mainChart.currentChartState.step / 2;

        const currentValue = this.currentData.find((item) => {
            const cursorX = e.clientX - this.detailsPanel.offsetLeft;
            return cursorX > (item.x - delta) && cursorX <= (item.x + delta);
        });

        if (currentValue) {
            if (this._popupHidden) {
                this._showPopup();
            }

            const date = currentValue.date.long;
            this.detailsPopup.querySelector('.details-popup__date').textContent = date;

            currentValue.values.forEach(item => {
                this._setMarkerPosition(item.name, currentValue.x, item.y);

                document.getElementById(item.name + this._chartId).querySelector('.details-popup__line-name').textContent = item.name;
                document.getElementById(item.name + this._chartId).querySelector('.details-popup__line-value').textContent = item.value;
            });

            this._setLinePosition(currentValue.x, e.offsetY);
        }
    }

    _setMarkerPosition(name, x, y) {
        document.getElementById('point-marker-' + name + this._chartId).style.left = x + 'px';
        document.getElementById('point-marker-' + name + this._chartId).style.top = y + 'px'
    }

    _setLinePosition(x, y) {
        if (x + this.detailsPopup.offsetWidth >= this.width) {
            this.detailsPopup.style.left = x - this.detailsPopup.offsetWidth - 18 + 'px';
        } else {
            this.detailsPopup.style.left = x + 'px';
        }

        if (y > this.height) {
            y = this.height;
        }

        if (y < 0) {
            y = 0;
        }

        this.detailsPopup.style.top = y + 'px';

        this.detailsLine.style.left = x + 'px';
    }

    _createPopup() {
        // TODO: привести к номальному виду popup
        this.detailsLine = document.createElement('div');
        this.detailsLine.classList.add('details-line');
        this.detailsLine.style.backgroundColor = chartColors.line.night;
        // TODO: config
        this.detailsLine.style.bottom = 55 + 'px';

        this.detailsPopup = document.createElement('div');
        this.detailsPopup.classList.add('details-popup');
        this.detailsPopup.style.backgroundColor = chartColors.main.night;

        const popupDate = document.createElement('h3');
        popupDate.classList.add('details-popup__date');

        this.detailsPopupInfo = document.createElement('div');
        this.detailsPopupInfo.classList.add('details-popup__info');

        this.detailsPopup.appendChild(popupDate);
        this.detailsPopup.appendChild(this.detailsPopupInfo);

        this.pointMarker = document.createElement('div');
        this.pointMarker.classList.add('point-marker');
        this.pointMarker.style.backgroundColor = chartColors.main.night;

        this.popupLineDetails = document.createElement('div');
        this.popupLineDetails.classList.add('details-popup__line-info');

        const popupLineName = document.createElement('p');
        popupLineName.classList.add('details-popup__line-name');
        const popupLineValue = document.createElement('p');
        popupLineValue.classList.add('details-popup__line-value');

        this.popupLineDetails.appendChild(popupLineValue);
        this.popupLineDetails.appendChild(popupLineName);

        this.detailsPanel.appendChild(this.detailsLine);
        this.detailsPanel.appendChild(this.detailsPopup);
    }

    _clearPopupDetails() {
        this.detailsPopupInfo.innerHTML = '';
    }

    _hidePopup() {
        this._popupHidden = true;
        this._clearPopupDetails();
        this.detailsPopup.style.display = 'none';
        this.detailsLine.style.display = 'none';
        this.detailsPanel.querySelectorAll('.point-marker').forEach(marker => {
            marker.remove();
        });
    }

    _showPopup() {
        this._popupHidden = false;
        this.detailsPopup.style.display = 'block';
        this.detailsLine.style.display = 'block';
        this.detailsPanel.querySelectorAll('.point-marker').forEach(marker => {
            marker.style.display = 'block';
        });
    }
}

export default ChartConstructor;
